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

export async function POST(request: Request) {
  return await ServerWatchdog.atomic('CheckoutAPI', 'SubmitOrder', {}, async () => {
    let rawBody: any = null;
    const headersList = headers();
    const host = headersList.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
    const marketConfig = MarketManager.getCurrentMarket(host);
    const baseUrl = MarketManager.getMarketDomains()[marketConfig.market_code] || `https://${host || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // 1. Validatie van de payload
    try {
      rawBody = await request.json();
    } catch (e: any) {
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
      return NextResponse.json({ error: 'Ongeldige bestelgegevens', details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    const {
      pricing, items, selectedActor, step, first_name, last_name, email,
      vat_number, postal_code, city, metadata, quoteMessage, phone,
      company, address_street, usage, plan, music, country, payment_method, language,
      billing_po, financial_email, isQuote
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
    let userId = metadata?.user_id;
    if (email) {
      const { data: user } = await sdkClient.from('users').select('id').eq('email', email).single();
      if (user) {
        userId = user.id;
      } else {
        const { data: newUser } = await sdkClient.from('users').insert({
          email, first_name: first_name, last_name: last_name, phone, companyName: company,
          vatNumber: vat_number, addressStreet: address_street, addressZip: postal_code,
          addressCity: city, addressCountry: country || 'BE', role: 'customer'
        }).select().single();
        userId = newUser?.id;
      }
    }

    // 5. Order Creation
    const { data: maxOrder } = await sdkClient.from('orders').select('wp_order_id').order('wp_order_id', { ascending: false }).limit(1).single();
    const uniqueWpId = Math.max((maxOrder?.wp_order_id ? Number(maxOrder.wp_order_id) : 0) + 1, 310001);

    const isQuoteRequest = isQuoteOnly || !!isQuote;
    const { data: newOrder, error: orderErr } = await sdkClient.from('orders').insert({
      wp_order_id: uniqueWpId,
      total: amount.toString(),
      total_tax: (amount - serverCalculatedSubtotal).toString(),
      status: isQuoteRequest ? 'quote-pending' : 'pending',
      user_id: userId || null,
      journey: validatedItems[0]?.journey || 'agency',
      billing_vat_number: vat_number || null,
      is_quote: !!isQuoteRequest,
      quote_message: quoteMessage || null,
      purchase_order: billing_po || null,
      billing_email_alt: financial_email || null,
      market: marketConfig.market_code,
      ip_address: ip,
      raw_meta: {
        usage,
        plan,
        items_count: validatedItems.length,
        customer: { email, first_name, last_name },
        language: normalizedLanguage,
        billing_po: billing_po || null,
        financial_email: financial_email || null,
        is_quote: !!isQuoteRequest
      }
    }).select().single();

    if (orderErr) throw new Error(`Order creation failed: ${orderErr.message}`);

    // 6. Order Items
    const itemsToInsert = validatedItems.map((item: any) => {
      const dbActor = actorMap.get(Number(item.actor?.id));
      
      // 🛡️ CHRIS-PROTOCOL: Handshake Truth (ID-First)
      // We resolve the country code to its official database ID for the meta_data.
      const countryId = MarketManager.getCountryLabel(item.country) ? 
                        (global as any).handshakeCountries?.find((c: any) => c.code === item.country || c.label === item.country)?.id : null;

      return {
        order_id: newOrder.id,
        actor_id: dbActor?.id || null,
        name: item.name || 'Product',
        quantity: 1,
        price: (item.pricing?.subtotal || 0).toString(),
        tax: (item.pricing?.tax || 0).toString(),
        meta_data: { 
          ...item.pricing, 
          briefing: item.briefing, 
          usage: item.usage, 
          media: item.media,
          spots: item.spots,
          years: item.years,
          live_session: item.liveSession,
          music: item.music,
          country_id: countryId || item.countryId, // 🛡️ Store the hard ID
          language_id: dbActor?.native_language_id // 🛡️ Store the hard ID
        },
        delivery_status: 'waiting'
      };
    });

    const { error: itemsErr } = await sdkClient.from('order_items').insert(itemsToInsert);
    if (itemsErr) throw new Error(`Order items failed: ${itemsErr.message}`);

    // 6.5 V2-FIRST MIRROR: garandeer directe write naar orders_v2.
    const normalizedJourney = normalizeJourneyCode(validatedItems[0]?.journey || 'agency');
    const worldId = DEFAULT_WORLD_BY_JOURNEY[normalizedJourney] || 1;
    const [journeyId, statusId, paymentMethodId] = await Promise.all([
      resolveLookupId('journeys', journeyCandidates(normalizedJourney)),
      resolveLookupId(
        'order_statuses',
        isQuoteRequest ? ['quote_pending', 'quote-pending'] : ['pending', 'awaiting_payment', 'unpaid']
      ),
      resolveLookupId(
        'payment_methods',
        isQuoteRequest || payment_method === 'banktransfer'
          ? ['manual_invoice', 'mollie_banktransfer', 'banktransfer']
          : ['mollie', 'mollie_ideal', 'online', 'card']
      ),
    ]);

    const { error: v2Err } = await sdkClient
      .from('orders_v2')
      .upsert(
        {
          id: uniqueWpId,
          user_id: userId || null,
          world_id: worldId,
          journey_id: journeyId,
          status_id: statusId,
          payment_method_id: paymentMethodId,
          amount_net: serverCalculatedSubtotal.toFixed(2),
          amount_total: amount.toFixed(2),
          purchase_order: billing_po || null,
          billing_email_alt: financial_email || null,
          created_at: newOrder.created_at || new Date().toISOString(),
          legacy_internal_id: newOrder.id,
        },
        { onConflict: 'id' }
      );

    if (v2Err) {
      throw new Error(`Orders V2 sync failed: ${v2Err.message}`);
    }

    // Compat-bridge: vul bloat entry zodat bestaande detail-weergaves niet breken.
    await sdkClient.from('orders_legacy_bloat').upsert(
      {
        wp_order_id: uniqueWpId,
        raw_meta: newOrder.raw_meta || {},
      },
      { onConflict: 'wp_order_id' }
    );

    // 7. Payment Handshake
    const secureToken = sign({ userId, orderId: newOrder.id, email }, process.env.JWT_SECRET || 'voices-secret-2026', { expiresIn: '24h' });

    if (isQuoteRequest || payment_method === 'banktransfer') {
      // Background notifications (non-blocking)
      (async () => {
        try {
          await fetch(`${baseUrl}/api/admin/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: isQuoteRequest ? 'quote_request' : 'banktransfer_order',
              data: { orderId: newOrder.id, email, amount, language: normalizedLanguage }
            })
          });
          const subject = isQuoteRequest
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

      return NextResponse.json({ success: true, orderId: newOrder.id, isQuote: isQuoteRequest, token: secureToken });
    }

    // Mollie Flow
    const mollieOrder = await MollieService.createOrder({
      amount: { currency: 'EUR', value: amount.toFixed(2) },
      orderNumber: newOrder.id.toString(),
      lines: validatedItems.map((i: any) => ({
        name: i.name || 'Voice Over',
        quantity: 1,
        unitPrice: { currency: 'EUR', value: (i.pricing?.total || 0).toFixed(2) },
        totalAmount: { currency: 'EUR', value: (i.pricing?.total || 0).toFixed(2) },
        vatRate: isVatExempt ? '0' : '21',
        vatAmount: { currency: 'EUR', value: (i.pricing?.tax || 0).toFixed(2) }
      })),
      billingAddress: { streetAndNumber: address_street || 'N/A', postalCode: postal_code || 'N/A', city: city || 'N/A', country: country || 'BE', givenName: first_name, familyName: last_name, email },
      redirectUrl: `${baseUrl}/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${newOrder.id}`,
      webhookUrl: `${baseUrl}/api/checkout/webhook`,
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

    return NextResponse.json({ success: true, orderId: newOrder.id, checkoutUrl: mollieOrder._links.checkout.href, token: secureToken });
  });
}
