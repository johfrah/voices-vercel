import { VatService } from '@/lib/compliance/vat-service';
import { LexCheck } from '@/lib/compliance/lex-check';
import { db, orders, users, centralLeads, actors, notifications, orderItems, systemEvents } from '@/lib/system/voices-config';
import { eq, inArray } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { MollieService } from '@/lib/payments/mollie';
import { SlimmeKassa, type CommercialMediaType } from '@/lib/engines/pricing-engine';
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

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  }
  const single = String(value || '').trim();
  return single ? [single] : [];
}

const COMMERCIAL_MEDIA_TYPES = new Set<CommercialMediaType>([
  'online',
  'tv_national',
  'radio_national',
  'podcast',
  'tv_regional',
  'tv_local',
  'radio_regional',
  'radio_local',
]);

function toCommercialMediaTypes(value: unknown): CommercialMediaType[] {
  return toStringArray(value).filter((media): media is CommercialMediaType =>
    COMMERCIAL_MEDIA_TYPES.has(media as CommercialMediaType),
  );
}

function normalizeCommercialFactor(
  value: unknown,
  mediaTypes: string[],
): Record<string, number> | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const normalized = Math.max(1, Math.round(value));
    const targetMedia = mediaTypes.length > 0 ? mediaTypes : ['online'];
    return targetMedia.reduce<Record<string, number>>((acc, mediaType) => {
      acc[mediaType] = normalized;
      return acc;
    }, {});
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const mapped = Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>((acc, [key, raw]) => {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed > 0) {
        acc[key] = Math.max(1, Math.round(parsed));
      }
      return acc;
    }, {});
    return Object.keys(mapped).length > 0 ? mapped : undefined;
  }

  return undefined;
}

function extractWorkshopId(item: Record<string, unknown>): number | null {
  const candidates = [item.workshop_id, item.workshopId, item.edition_id, item.editionId, item.id];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return Math.round(candidate);
    }
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      const direct = Number(trimmed);
      if (Number.isFinite(direct) && direct > 0) {
        return Math.round(direct);
      }
      const match = trimmed.match(/(\d+)$/);
      if (match) {
        const fromSuffix = Number(match[1]);
        if (Number.isFinite(fromSuffix) && fromSuffix > 0) {
          return Math.round(fromSuffix);
        }
      }
    }
  }
  return null;
}

function toSafeNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function extractProxyPath(rawValue: string): string | null {
  const queryStart = rawValue.indexOf('?');
  if (queryStart === -1) return null;
  const params = new URLSearchParams(rawValue.slice(queryStart + 1));
  const pathValue = params.get('path');
  return pathValue ? decodeURIComponent(pathValue) : null;
}

function resolveCheckoutItemThumbnail(item: any, dbActor: any, host: string): string | undefined {
  const candidate =
    item?.thumbnail_url ||
    item?.featured_image_url ||
    item?.image_url ||
    item?.media_url ||
    item?.actor?.photo_url ||
    item?.actor?.thumbnail_url ||
    dbActor?.dropbox_url ||
    null;

  if (!candidate || typeof candidate !== 'string') return undefined;
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate;
  }

  const rawCandidate = candidate.trim();
  if (
    rawCandidate.startsWith('/') &&
    !rawCandidate.startsWith('/assets/') &&
    !rawCandidate.startsWith('/wp-content/') &&
    !rawCandidate.startsWith('/api/')
  ) {
    return `https://${host}${rawCandidate}`;
  }

  let normalizedPath = rawCandidate;
  if (normalizedPath.includes('/api/proxy') && normalizedPath.includes('?path=')) {
    const extractedPath = extractProxyPath(normalizedPath);
    normalizedPath = extractedPath || normalizedPath;
  }

  normalizedPath = normalizedPath.startsWith('/assets/') ? normalizedPath.slice('/assets/'.length) : normalizedPath;
  normalizedPath = normalizedPath.startsWith('assets/') ? normalizedPath.slice('assets/'.length) : normalizedPath;
  normalizedPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  if (normalizedPath.startsWith('wp-content/') || normalizedPath.startsWith('api/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  if (!normalizedPath) return undefined;

  return `https://${host}/api/proxy/?path=${encodeURIComponent(normalizedPath)}`;
}

function resolveCheckoutItemDescription(item: any): string {
  const usage = item?.usage ? String(item.usage).replace(/_/g, ' ') : '';
  const media = Array.isArray(item?.media) && item.media.length > 0 ? item.media.join(', ') : '';
  const country = item?.country ? String(item.country) : '';
  return [usage, media, country].filter(Boolean).join(' • ');
}

function buildOrderEmailItems(validatedItems: any[], actorMap: Map<number, any>, host: string): Array<{
  name: string;
  price: number;
  quantity: number;
  unitPrice: number;
  deliveryTime?: string;
  description?: string;
  thumbnailUrl?: string;
  projectCode?: string;
}> {
  return (validatedItems || []).map((item: any) => {
    const dbActor = actorMap.get(Number(item?.actor?.id));
    const lineTotal = toSafeNumber(item?.pricing?.total || item?.pricing?.subtotal || item?.price || 0);
    const quantity = Math.max(1, toSafeNumber(item?.quantity || 1));
    return {
      name: item?.name || item?.actor?.display_name || item?.actor?.first_name || 'Voice-over',
      price: lineTotal,
      quantity,
      unitPrice: quantity > 0 ? lineTotal / quantity : lineTotal,
      deliveryTime: item?.actor?.delivery_time || item?.actor?.deliveryTime || dbActor?.deliveryTime || undefined,
      description: item?.description || resolveCheckoutItemDescription(item) || undefined,
      thumbnailUrl: resolveCheckoutItemThumbnail(item, dbActor, host),
      projectCode: item?.project_code || item?.id || undefined,
    };
  });
}
export async function POST(request: Request) {
  return await ServerWatchdog.atomic('CheckoutAPI', 'SubmitOrder', {}, async () => {
    let rawBody: any = null;
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
      billing_po, purchase_order, financial_email, billing_email_alt
    } = data;
    const resolvedPurchaseOrder = String(billing_po || purchase_order || '').trim() || null;
    const resolvedBillingEmailAlt = String(financial_email || billing_email_alt || '').trim().toLowerCase() || null;
    const normalizedLanguage = normalizeLocale(language || marketConfig.primary_language || 'nl-be');
    const languageShort = localeToShort(normalizedLanguage);
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Leeg mandje. Voeg eerst een voice-over toe.' }, { status: 400 });
    }

    // 2. Fetch Data voor prijsvalidatie
    const actorIds = Array.from(new Set([
      ...(items || []).map((i: any) => i.actor?.id).filter((id: unknown) => Number.isFinite(Number(id))),
      ...(selectedActor?.id ? [selectedActor.id] : [])
    ])).map(id => Number(id));

    const editionIds = Array.from(new Set(
      (items || [])
        .map((i: any) => Number(i.editionId ?? i.edition_id))
        .filter((id: number) => Number.isFinite(id) && id > 0)
    ));

    const { data: dbEditions } = editionIds.length
      ? await sdkClient
          .from('workshop_editions')
          .select('id, workshop_id, price')
          .in('id', editionIds)
      : { data: [] as any[] };

    const editionWorkshopIds = (dbEditions || [])
      .map((edition: any) => Number(edition.workshop_id))
      .filter((id: number) => Number.isFinite(id) && id > 0);

    const workshopIds = Array.from(new Set([
      ...(items || [])
        .map((i: any) => extractWorkshopId(i as Record<string, unknown>))
        .filter((id: number | null): id is number => id !== null),
      ...editionWorkshopIds,
    ])).map(id => Number(id));

    const dbActors =
      actorIds.length > 0
        ? (await sdkClient.from('actors').select('*').or(`id.in.(${actorIds.join(',')}),wp_product_id.in.(${actorIds.join(',')})`)).data || []
        : [];
    const dbWorkshops =
      workshopIds.length > 0
        ? (await sdkClient.from('workshops').select('*').in('id', workshopIds)).data || []
        : [];

    const actorMap = new Map();
    (dbActors || []).forEach(a => {
      actorMap.set(Number(a.id), a);
      if (a.wp_product_id) actorMap.set(Number(a.wp_product_id), a);
    });
    const workshopMap = new Map((dbWorkshops || []).map(w => [Number(w.id), w]));
    const editionMap = new Map((dbEditions || []).map((edition: any) => [Number(edition.id), edition]));

    const isVatExempt = !!vat_number && vat_number.length > 2 && !vat_number.startsWith('BE'); 
    const taxRate = isVatExempt ? 0 : 0.21;

    // 3. Prijs Validatie
    let serverCalculatedSubtotal = 0;
    let isQuoteOnly = false;
    const itemValidationErrors: Array<{ item_id: string; item_type: string; reason: string }> = [];
    const validatedItems = (items || []).flatMap((item: any, index: number) => {
      const itemId = String(item.id || `idx_${index}`);
      const itemType = String(item.type || '');

      if (itemType === 'voice_over') {
        const actorId = Number(item.actor?.id);
        if (!Number.isFinite(actorId) || actorId <= 0) {
          itemValidationErrors.push({
            item_id: itemId,
            item_type: itemType,
            reason: 'Voice-over item mist een geldige actor_id',
          });
          return [];
        }

        const dbActor = actorMap.get(actorId);
        if (!dbActor) {
          itemValidationErrors.push({
            item_id: itemId,
            item_type: itemType,
            reason: `Voice-over actor ${actorId} niet gevonden`,
          });
          return [];
        }

        const scriptText = String(item.briefing || item.script || '').trim();
        if (!scriptText) {
          itemValidationErrors.push({
            item_id: itemId,
            item_type: itemType,
            reason: 'Voice-over item mist briefing/script',
          });
          return [];
        }

        const mediaTypes = toCommercialMediaTypes(item.media);
        const countries = toStringArray(item.country);
        const primaryCountry = countries[0] || 'BE';
        const spotsByMedia = normalizeCommercialFactor(item.spots, mediaTypes);
        const yearsByMedia = normalizeCommercialFactor(item.years, mediaTypes);
        const result = SlimmeKassa.calculate({
          usage: item.usage,
          words: scriptText.split(/\s+/).filter(Boolean).length || 0,
          mediaTypes,
          countries,
          country: primaryCountry,
          spots: spotsByMedia,
          years: yearsByMedia,
          liveSession: item.liveSession,
          actorRates: dbActor,
          music: item.music,
          isVatExempt,
        });
        if (result.isQuoteOnly) isQuoteOnly = true;
        serverCalculatedSubtotal += result.subtotal;
        return [{ ...item, pricing: result }];
      }
      if (itemType === 'workshop_edition') {
        const editionId = Number(item.editionId ?? item.edition_id);
        const dbEdition = Number.isFinite(editionId) && editionId > 0 ? editionMap.get(editionId) : null;
        const extractedWorkshopId = extractWorkshopId(item as Record<string, unknown>);
        const workshopIdFromEdition = Number(dbEdition?.workshop_id || 0);
        const workshopId = extractedWorkshopId ?? (
          Number.isFinite(workshopIdFromEdition) && workshopIdFromEdition > 0
            ? workshopIdFromEdition
            : null
        );
        const dbWorkshop = workshopId && Number.isFinite(workshopId) ? workshopMap.get(Number(workshopId)) : null;

        if (!workshopId || !dbWorkshop) {
          itemValidationErrors.push({
            item_id: itemId,
            item_type: itemType,
            reason: 'Workshop item mist een geldige workshop_id',
          });
          return [];
        }

        const priceCandidates = [
          Number(dbEdition?.price),
          Number(dbWorkshop.price),
          Number(item.price),
          Number(item.pricing?.subtotal),
          Number(item.pricing?.total),
        ];
        const resolvedSubtotal = priceCandidates.find((value) => Number.isFinite(value) && value > 0) ?? 0;
        if (resolvedSubtotal <= 0) {
          itemValidationErrors.push({
            item_id: itemId,
            item_type: itemType,
            reason: `Workshop ${workshopId} heeft geen geldige prijs`,
          });
          return [];
        }
        const resolvedTax = Math.round(resolvedSubtotal * taxRate * 100) / 100;
        const resolvedTotal = Math.round((resolvedSubtotal + resolvedTax) * 100) / 100;

        serverCalculatedSubtotal += resolvedSubtotal;
        return [{
          ...item,
          workshop_id: workshopId ?? item.workshop_id ?? item.workshopId ?? null,
          editionId: Number.isFinite(editionId) && editionId > 0 ? editionId : item.editionId,
          pricing: { total: resolvedTotal, subtotal: resolvedSubtotal, tax: resolvedTax },
        }];
      }

      itemValidationErrors.push({
        item_id: itemId,
        item_type: itemType || 'unknown',
        reason: `Onbekend item type '${itemType || 'unknown'}'`,
      });
      return [];
    });

    if (itemValidationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Een of meer orderregels zijn ongeldig',
          details: itemValidationErrors,
        },
        { status: 422 },
      );
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: 'Leeg mandje. Voeg eerst een voice-over toe.' }, { status: 400 });
    }

    const requestedQuote = Boolean((rawBody as { isQuote?: unknown })?.isQuote);
    const isQuote = isQuoteOnly || requestedQuote;
    const amount = Math.round(serverCalculatedSubtotal * (1 + taxRate) * 100) / 100;
    if (!isQuote && amount <= 0) {
      return NextResponse.json({ error: 'Kon geen geldige prijs berekenen voor deze bestelling.' }, { status: 400 });
    }

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

    const { data: newOrder, error: orderErr } = await sdkClient.from('orders').insert({
      wp_order_id: uniqueWpId,
      total: amount.toString(),
      total_tax: (amount - serverCalculatedSubtotal).toString(),
      status: isQuote ? 'quote-pending' : 'pending',
      user_id: userId || null,
      journey: validatedItems[0]?.journey || 'agency',
      purchase_order: resolvedPurchaseOrder,
      billing_email_alt: resolvedBillingEmailAlt,
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
        customer: {
          email,
          financial_email: resolvedBillingEmailAlt,
          purchase_order: resolvedPurchaseOrder,
          first_name,
          last_name,
        },
        items: validatedItems,
      }
    }).select().single();

    if (orderErr) throw new Error(`Order creation failed: ${orderErr.message}`);

    // 6. Order Items
    const itemsToInsert = validatedItems.flatMap((item: any) => {
      const dbActor = actorMap.get(Number(item.actor?.id));
      const primaryCountry = toStringArray(item.country)[0] || '';
      
      // 🛡️ CHRIS-PROTOCOL: Handshake Truth (ID-First)
      // We resolve the country code to its official database ID for the meta_data.
      const countryId = MarketManager.getCountryLabel(primaryCountry) ? 
                        (global as any).handshakeCountries?.find((c: any) => c.code === primaryCountry || c.label === primaryCountry)?.id : null;
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
      const emailItemSnapshot = {
        description: item.description || resolveCheckoutItemDescription(item) || null,
        thumbnail_url: resolveCheckoutItemThumbnail(item, dbActor, host) || null,
        delivery_time: item.actor?.delivery_time || item.actor?.deliveryTime || dbActor?.deliveryTime || null,
        quantity: Math.max(1, toSafeNumber(item.quantity || 1)),
        unit_price: voiceSubtotal > 0 ? voiceSubtotal : itemSubtotal,
        project_code: item.project_code || item.id || null,
      };

      const voiceRow = {
        order_id: newOrder.id,
        actor_id: dbActor?.id || null,
        edition_id: item.editionId || item.edition_id || null,
        name: item.name || 'Product',
        quantity: 1,
        price: voiceSubtotal.toFixed(2),
        tax: voiceTax.toFixed(2),
        meta_data: { 
          ...item.pricing, 
          item_type: 'voice',
          briefing: item.briefing, 
          usage: item.usage, 
          purchase_order: resolvedPurchaseOrder,
          billing_email_alt: resolvedBillingEmailAlt,
          billing_vat_number: vat_number || null,
          company_name: company || null,
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
          email_item_snapshot: emailItemSnapshot,
          // 🛡️ Store hard IDs and participant context for analytics
          country_id: countryId || item.countryId || item.country_id,
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
          purchase_order: resolvedPurchaseOrder,
          billing_email_alt: resolvedBillingEmailAlt,
          billing_vat_number: vat_number || null,
          company_name: company || null,
          email_item_snapshot: {
            description: `Music track: ${musicTrackLabel}`,
            thumbnail_url: null,
            delivery_time: item.actor?.delivery_time || item.actor?.deliveryTime || null,
            quantity: 1,
            unit_price: musicSurcharge,
            project_code: item.project_code || item.id || null,
          },
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
          country_id: countryId || item.countryId || item.country_id || null,
        },
        delivery_status: 'waiting'
      };

      if (voiceSubtotal <= 0) {
        return [musicRow];
      }

      return [voiceRow, musicRow];
    });
    if (itemsToInsert.length === 0) {
      return NextResponse.json({ error: 'Geen geldige orderregels gevonden.' }, { status: 400 });
    }

    const { error: itemsErr } = await sdkClient.from('order_items').insert(itemsToInsert);
    if (itemsErr) throw new Error(`Order items failed: ${itemsErr.message}`);

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
              subtotal: serverCalculatedSubtotal,
              tax: amount - serverCalculatedSubtotal,
              items: buildOrderEmailItems(validatedItems, actorMap, host),
              paymentMethod: payment_method,
              language: normalizedLanguage,
              ctaUrl: `${baseUrl}/account/orders?orderId=${encodeURIComponent(newOrder.id)}`,
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
      lines: validatedItems.map((i: any) => ({
        name: i.name || 'Voice Over',
        quantity: 1,
        unitPrice: { currency: 'EUR', value: (i.pricing?.total || 0).toFixed(2) },
        totalAmount: { currency: 'EUR', value: (i.pricing?.total || 0).toFixed(2) },
        vatRate: isVatExempt ? '0' : '21',
        vatAmount: { currency: 'EUR', value: (i.pricing?.tax || 0).toFixed(2) }
      })),
      billingAddress: { streetAndNumber: address_street || 'N/A', postalCode: postal_code || 'N/A', city: city || 'N/A', country: country || 'BE', givenName: first_name, familyName: last_name, email },
      redirectUrl: `${baseUrl}/api/auth/magic-login?token=${secureToken}&redirect=/account/orders?orderId=${newOrder.id}&email=${encodeURIComponent(email)}`,
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
}
