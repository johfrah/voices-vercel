import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db, orders, users, centralLeads, actors, notifications, orderItems, systemEvents } from '@/lib/system/voices-config';
import { eq, inArray } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { MollieService } from '@/lib/payments/mollie';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';
import { generateCartHash } from '@/lib/utils/cart-utils';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CheckoutPayloadSchema } from '@/lib/validation/checkout-schema';
import { YukiService } from '@/lib/services/yuki-service';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { ServerWatchdog } from '@/lib/services/server-watchdog';
import { localeToMollie, localeToShort, normalizeLocale } from '@/lib/system/locale-utils';

export const dynamic = 'force-dynamic';

/**
 * HEADLESS CHECKOUT SUBMIT HANDLER (2026) - ATOMIC EDITION
 * 
 * Beheert zowel Mollie betalingen als Factuur/Offerte aanvragen.
 * 
 * 🛡️ CHRIS-PROTOCOL: Ultra-Forensic Atomic Logging (v2.14.510)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

const DEFAULT_WORLD_BY_JOURNEY: Record<string, number> = {
  agency: 1,
  studio: 2,
  academy: 3,
  portfolio: 5,
  ademing: 6,
  freelance: 7,
  partner: 8,
  johfrai: 10,
  artist: 25,
};

function normalizeJourneyCode(value: unknown): string {
  const raw = String(value || 'agency').trim().toLowerCase();
  if (!raw) return 'agency';
  return raw;
}

function journeyCandidates(journeyCode: string): string[] {
  const candidates = new Set<string>([journeyCode]);
  if (journeyCode === 'agency') {
    candidates.add('agency_vo');
    candidates.add('agency_ivr');
    candidates.add('agency_commercial');
  }
  if (journeyCode.startsWith('agency_')) {
    candidates.add('agency');
  }
  return Array.from(candidates);
}

async function resolveLookupId(table: 'journeys' | 'order_statuses' | 'payment_methods', codes: string[]): Promise<number | null> {
  const normalizedCodes = Array.from(
    new Set(codes.map((code) => String(code || '').trim().toLowerCase()).filter(Boolean))
  );
  if (normalizedCodes.length === 0) return null;

  const { data, error } = await sdkClient
    .from(table)
    .select('id, code')
    .in('code', normalizedCodes)
    .limit(1);

  if (error || !data?.length) return null;
  return Number(data[0].id);
}

function formatMusicTrackLabel(trackId: unknown): string {
  const normalized = String(trackId || '').trim();
  if (!normalized) return '';
  return normalized
    .split(/[-_]+/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function fireAdminNotify(baseUrl: string, type: string, data: Record<string, any>) {
  try {
    await fetch(`${baseUrl}/api/admin/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
  } catch (notifyErr: any) {
    console.warn(`[CheckoutAPI] Failed to send admin notify (${type}):`, notifyErr?.message || notifyErr);
  }
}
export async function POST(request: Request) {
  const headersList = headers();
  const host = headersList.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
  const marketConfig = MarketManager.getCurrentMarket(host);
  const marketBaseUrl =
    MarketManager.getMarketDomains()[marketConfig.market_code] ||
    `https://${host || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
  const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
  const baseUrl = isLocalHost ? `http://${host}` : marketBaseUrl;
  const webhookBaseUrl = marketBaseUrl;
  const ip = headersList.get('x-forwarded-for') || 'unknown';

  const alertContext: Record<string, any> = {
    source: 'CheckoutAPI',
    host,
    ip
  };

  try {
    return await ServerWatchdog.atomic('CheckoutAPI', 'SubmitOrder', {}, async () => {
    let rawBody: any = null;

    // 1. Validatie van de payload
    try {
      rawBody = await request.json();
      alertContext.email = rawBody?.email || null;
      alertContext.company = rawBody?.company || null;
      alertContext.paymentMethod = rawBody?.payment_method || null;
      alertContext.usage = rawBody?.usage || null;
      alertContext.itemsCount = Array.isArray(rawBody?.items) ? rawBody.items.length : 0;
    } catch (e: any) {
      await fireAdminNotify(baseUrl, 'checkout_error', {
        ...alertContext,
        error: `JSON Parse Error: ${e.message}`,
        step: 'request_json_parse'
      });
      throw new Error(`JSON Parse Error: ${e.message}`);
    }
    
    const validation = CheckoutPayloadSchema.safeParse(rawBody);
    if (!validation.success) {
      await ServerWatchdog.report({
        level: 'error',
        component: 'CheckoutAPI',
        error: 'Gegevens onvolledig',
        payload: { errors: validation.error.format(), rawBody }
      });
      await fireAdminNotify(baseUrl, 'checkout_error', {
        ...alertContext,
        error: 'Checkout payload validation failed',
        step: 'payload_validation',
        validationErrors: validation.error.flatten()
      });
      return NextResponse.json({ error: 'Ongeldige bestelgegevens', details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    const { 
      pricing, items, selectedActor, step, first_name, last_name, email, 
      vat_number, postal_code, city, metadata, quoteMessage, phone, 
      company, address_street, usage, plan, music, country, payment_method, language
    } = data;
    const normalizedLanguage = normalizeLocale(language || marketConfig.primary_language || 'nl-be');
    const languageShort = localeToShort(normalizedLanguage);

    // 2. Fetch Data voor prijsvalidatie
    const actorIds = Array.from(new Set([
      ...(items || []).map((i: any) => i.actor?.id).filter(Boolean),
      ...(selectedActor?.id ? [selectedActor.id] : [])
    ])).map(id => Number(id));

    const workshopIds = Array.from(new Set([
      ...(items || []).map((i: any) => i.id).filter((id: any) => !isNaN(Number(id)) && Number(id) > 0)
    ])).map(id => Number(id));

    const { data: dbActors } = await sdkClient.from('actors').select('*').or(`id.in.(${actorIds.join(',')}),wp_product_id.in.(${actorIds.join(',')})`);
    const { data: dbWorkshops } = await sdkClient.from('workshops').select('*').in('id', workshopIds);

    const actorMap = new Map();
    (dbActors || []).forEach(a => {
      actorMap.set(Number(a.id), a);
      if (a.wp_product_id) actorMap.set(Number(a.wp_product_id), a);
    });
    const workshopMap = new Map((dbWorkshops || []).map(w => [Number(w.id), w]));

    const isVatExempt = !!vat_number && vat_number.length > 2 && !vat_number.startsWith('BE'); 
    const taxRate = isVatExempt ? 0 : 0.21;

    // 3. Prijs Validatie
    let serverCalculatedSubtotal = 0;
    let isQuoteOnly = false;

    const validatedItems = (items || []).map((item: any) => {
      if (item.type === 'voice_over') {
        const dbActor = actorMap.get(Number(item.actor?.id));
        if (!dbActor) return item;
        const result = SlimmeKassa.calculate({
          usage: item.usage,
          words: item.briefing?.trim().split(/\s+/).filter(Boolean).length || 0,
          mediaTypes: item.media,
          country: item.country,
          spots: item.spots,
          years: item.years,
          liveSession: item.liveSession,
          actorRates: dbActor,
          music: item.music,
          isVatExempt
        });
        if (result.isQuoteOnly) isQuoteOnly = true;
        serverCalculatedSubtotal += result.subtotal;
        return { ...item, pricing: result };
      }
      if (item.type === 'workshop_edition') {
        const dbWorkshop = workshopMap.get(Number(item.id));
        const price = dbWorkshop ? Number(dbWorkshop.price) : 0;
        serverCalculatedSubtotal += price;
        return { ...item, pricing: { total: price, subtotal: price, tax: price * taxRate } };
      }
      return item;
    });

    const amount = Math.round(serverCalculatedSubtotal * (1 + taxRate) * 100) / 100;

    // 4. User Management
    let userId = metadata?.user_id ? Number(metadata.user_id) : null;
    if (email) {
      const { data: existingUsers, error: existingUserErr } = await sdkClient
        .from('users')
        .select('id')
        .eq('email', email)
        .order('id', { ascending: false })
        .limit(1);

      if (existingUserErr) {
        throw new Error(`User lookup failed: ${existingUserErr.message}`);
      }

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        userId = Number(existingUsers[0].id);
      } else {
        const { data: newUser, error: newUserErr } = await sdkClient
          .from('users')
          .insert({
            email,
            first_name: first_name,
            last_name: last_name,
            phone: phone || null,
            company_name: company || null,
            vat_number: vat_number || null,
            address_street: address_street || null,
            address_zip: postal_code || null,
            address_city: city || null,
            address_country: country || 'BE',
            role: 'customer'
          })
          .select('id')
          .single();

        if (newUserErr) {
          throw new Error(`User creation failed: ${newUserErr.message}`);
        }

        userId = newUser?.id ? Number(newUser.id) : null;
      }
    }

    // 5. Order Creation
    const { data: maxOrder } = await sdkClient.from('orders').select('wp_order_id').order('wp_order_id', { ascending: false }).limit(1).single();
    const uniqueWpId = Math.max((maxOrder?.wp_order_id ? Number(maxOrder.wp_order_id) : 0) + 1, 310001);

    const isQuote = isQuoteOnly || (rawBody as any).isQuote;
    const { data: newOrder, error: orderErr } = await sdkClient.from('orders').insert({
      wp_order_id: uniqueWpId,
      total: amount.toString(),
      total_tax: (amount - serverCalculatedSubtotal).toString(),
      status: isQuote ? 'quote-pending' : 'pending',
      user_id: userId || null,
      journey: validatedItems[0]?.journey || 'agency',
      billing_vat_number: vat_number || null,
      is_quote: !!isQuote,
      quote_message: quoteMessage || null,
      market: marketConfig.market_code,
      ip_address: ip,
      raw_meta: {
        usage,
        plan,
        language: normalizedLanguage,
        itemsCount: validatedItems.length,
        customer: { email, first_name, last_name }
      }
    }).select().single();

    if (orderErr) throw new Error(`Order creation failed: ${orderErr.message}`);
    alertContext.orderId = newOrder.id;
    alertContext.amount = amount;
    alertContext.journey = validatedItems[0]?.journey || 'agency';

    // 6. Order Items
    const itemsToInsert = validatedItems.flatMap((item: any) => {
      const dbActor = actorMap.get(Number(item.actor?.id));
      
      // 🛡️ CHRIS-PROTOCOL: Handshake Truth (ID-First)
      // We resolve the country code to its official database ID for the meta_data.
      const countryId = MarketManager.getCountryLabel(item.country) ? 
                        (global as any).handshakeCountries?.find((c: any) => c.code === item.country || c.label === item.country)?.id : null;
      const itemSubtotal = Number(item.pricing?.subtotal || 0);
      const musicSurchargeRaw = Number(item.pricing?.musicSurcharge || 0);
      const musicTrackId = String(item.music?.trackId || '').trim();
      const musicAsBackground = !!item.music?.asBackground;
      const musicAsHoldMusic = !!item.music?.asHoldMusic;
      const hasMusicChoice = !!musicTrackId && (musicAsBackground || musicAsHoldMusic);
      const splitMusicLine = hasMusicChoice && musicSurchargeRaw > 0;
      const musicSurcharge = splitMusicLine ? Math.min(itemSubtotal, Math.max(0, musicSurchargeRaw)) : 0;
      const voiceSubtotal = Math.max(0, itemSubtotal - musicSurcharge);
      const voiceTax = Math.round(voiceSubtotal * taxRate * 100) / 100;
      const musicTax = Math.round(musicSurcharge * taxRate * 100) / 100;

      const voiceRow = {
        order_id: newOrder.id,
        actor_id: dbActor?.id || null,
        edition_id: item.editionId || null,
        name: item.name || 'Product',
        quantity: 1,
        price: voiceSubtotal.toFixed(2),
        tax: voiceTax.toFixed(2),
        meta_data: { 
          ...item.pricing, 
          item_type: 'voice',
          briefing: item.briefing, 
          usage: item.usage, 
          media: item.media,
          spots: item.spots,
          years: item.years,
          live_session: item.liveSession,
          music: splitMusicLine ? null : item.music,
          selected_music: hasMusicChoice
            ? {
                track_id: musicTrackId,
                track_label: formatMusicTrackLabel(musicTrackId) || musicTrackId,
                as_background: musicAsBackground,
                as_hold_music: musicAsHoldMusic,
              }
            : null,
          // 🛡️ Store hard IDs and participant context for analytics
          country_id: countryId || item.countryId,
          language_id: dbActor?.native_language_id,
          participant_info: item.participant_info || undefined
        },
        delivery_status: 'waiting'
      };
      if (!splitMusicLine) {
        return [voiceRow];
      }

      const musicTrackLabel = formatMusicTrackLabel(musicTrackId) || musicTrackId;
      const musicRow = {
        order_id: newOrder.id,
        actor_id: null,
        name: `Muziek • ${musicTrackLabel}`,
        quantity: 1,
        price: musicSurcharge.toFixed(2),
        tax: musicTax.toFixed(2),
        meta_data: {
          item_type: 'music',
          music_choice: {
            track_id: musicTrackId,
            track_label: musicTrackLabel,
            as_background: musicAsBackground,
            as_hold_music: musicAsHoldMusic,
            source_actor_id: dbActor?.id || null,
            source_item_name: item.name || 'voice_over',
          },
          usage: item.usage || null,
          media: item.media || [],
          journey: item.journey || null,
          country_id: countryId || item.countryId || null,
        },
        delivery_status: 'waiting'
      };

      if (voiceSubtotal <= 0) {
        return [musicRow];
      }

      return [voiceRow, musicRow];
    });

    const { error: itemsErr } = await sdkClient.from('order_items').insert(itemsToInsert);
    if (itemsErr) throw new Error(`Order items failed: ${itemsErr.message}`);

    await fireAdminNotify(baseUrl, 'checkout_submitted', {
      orderId: newOrder.id,
      email,
      company: company || null,
      amount,
      paymentMethod: payment_method || 'mollie',
      usage: usage || validatedItems[0]?.usage || null,
      journey: validatedItems[0]?.journey || 'agency',
      itemsCount: validatedItems.length,
      ip,
      language: normalizedLanguage
    });

    // 7. Payment Handshake
    const secureToken = sign({ userId, orderId: newOrder.id, email }, process.env.JWT_SECRET || 'voices-secret-2026', { expiresIn: '24h' });

    if (isQuote || payment_method === 'banktransfer') {
      // Background notifications (non-blocking)
      (async () => {
        try {
          await fetch(`${baseUrl}/api/admin/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: isQuote ? 'quote_request' : 'banktransfer_order',
              data: { orderId: newOrder.id, email, amount, language: normalizedLanguage }
            })
          });
          const subject = isQuote
            ? (languageShort === 'fr'
              ? `Demande de devis reçue : #${newOrder.id}`
              : languageShort === 'en'
                ? `Quote request received: #${newOrder.id}`
                : `Offerte-aanvraag ontvangen: #${newOrder.id}`)
            : (languageShort === 'fr'
              ? `Commande reçue : #${newOrder.id}`
              : languageShort === 'en'
                ? `Order received: #${newOrder.id}`
                : `Bestelling ontvangen: #${newOrder.id}`);
          await VumeEngine.send({
            to: email,
            subject,
            template: 'order-confirmation',
            context: {
              userName: first_name,
              orderId: newOrder.id,
              total: amount,
              items: validatedItems.map((item: any) => ({
                name: item.name || item.actor?.display_name || 'Voice Over',
                price: Number(item.pricing?.total || item.pricing?.subtotal || 0),
                deliveryTime: item.actor?.delivery_time || item.actor?.deliveryTime
              })),
              paymentMethod: payment_method,
              language: normalizedLanguage
            },
            host
          });
        } catch (e) {}
      })();

      return NextResponse.json({ success: true, orderId: newOrder.id, isQuote, token: secureToken });
    }

    // Mollie Flow
    const mollieOrder = await MollieService.createOrder({
      amount: { currency: 'EUR', value: amount.toFixed(2) },
      orderNumber: newOrder.id.toString(),
      lines: validatedItems.map((i: any) => {
        const lineTotal = Number(i.pricing?.total ?? i.pricing?.subtotal ?? 0);
        const explicitVat = Number(i.pricing?.vat ?? i.pricing?.tax ?? 0);
        const vatFromDiff = Number.isFinite(lineTotal) && Number.isFinite(Number(i.pricing?.subtotal))
          ? Math.max(0, lineTotal - Number(i.pricing?.subtotal || 0))
          : 0;
        const safeVat = isVatExempt
          ? 0
          : (explicitVat > 0 ? explicitVat : vatFromDiff);

        return {
          name: i.name || 'Voice Over',
          quantity: 1,
          unitPrice: { currency: 'EUR', value: lineTotal.toFixed(2) },
          totalAmount: { currency: 'EUR', value: lineTotal.toFixed(2) },
          vatRate: isVatExempt ? '0' : '21',
          vatAmount: { currency: 'EUR', value: safeVat.toFixed(2) }
        };
      }),
      billingAddress: { streetAndNumber: address_street || 'N/A', postalCode: postal_code || 'N/A', city: city || 'N/A', country: country || 'BE', givenName: first_name, familyName: last_name, email },
      redirectUrl: `${baseUrl}/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${newOrder.id}`,
      webhookUrl: `${webhookBaseUrl}/api/checkout/webhook`,
      locale: localeToMollie(normalizedLanguage) as any,
      metadata: {
        orderId: newOrder.id,
        user_id: userId || null,
        email,
        company: company || null,
        givenName: first_name,
        familyName: last_name,
        language: normalizedLanguage
      }
    });

    // Customer receipt for Mollie checkout submit (pending payment),
    // so the user always gets immediate confirmation of the action.
    (async () => {
      try {
        const mollieSubject = languageShort === 'fr'
          ? `Commande reçue (paiement en attente) : #${newOrder.id}`
          : languageShort === 'en'
            ? `Order received (payment pending): #${newOrder.id}`
            : `Bestelling ontvangen (betaling in behandeling): #${newOrder.id}`;

        await VumeEngine.send({
          to: email,
          subject: mollieSubject,
          template: 'order-confirmation',
          context: {
            userName: first_name,
            orderId: newOrder.id,
            total: amount,
            items: validatedItems.map((item: any) => ({
              name: item.name || item.actor?.display_name || 'Voice Over',
              price: Number(item.pricing?.total || item.pricing?.subtotal || 0),
              deliveryTime: item.actor?.delivery_time || item.actor?.deliveryTime
            })),
            paymentMethod: payment_method || 'mollie',
            language: normalizedLanguage
          },
          host
        });
      } catch (mailErr) {
        console.warn('[Checkout] Failed to send Mollie submit confirmation:', mailErr);
      }
    })();

    return NextResponse.json({ success: true, orderId: newOrder.id, checkoutUrl: mollieOrder._links.checkout.href, token: secureToken });
  });
  } catch (error: any) {
    await fireAdminNotify(baseUrl, 'checkout_error', {
      ...alertContext,
      error: error?.message || 'Unknown checkout error',
      step: 'checkout_submit_crash'
    });

    return NextResponse.json({
      error: 'Checkout flow failed',
      details: process.env.NODE_ENV !== 'production' ? error?.message : undefined
    }, { status: 500 });
  }
}
