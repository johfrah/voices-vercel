import { NextResponse } from 'next/server';
import { SlimmeKassa, DEFAULT_KASSA_CONFIG, type CommercialMediaType } from '@/lib/engines/pricing-engine';

/**
 * LEGACY PRICING ENDPOINT (CANONICAL BRIDGE)
 *
 * Dit endpoint blijft bestaan voor backwards compatibility,
 * maar rekent nu via de canonieke SlimmeKassa.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      basePrice,
      category,
      duration,
      market,
      hasVatNumber,
      spots,
      years,
      mediaType
    } = body ?? {};

    const normalizedCategory = String(category || '').toLowerCase();
    const normalizedMarket = String(market || 'BE').toUpperCase();
    const parsedBase = Number(basePrice);
    const parsedDuration = Number(duration);
    const parsedSpots = Math.max(1, Number(spots) || 1);
    const parsedYears = Math.max(0.25, Number(years) || 1);

    const config = {
      ...DEFAULT_KASSA_CONFIG,
      ...(Number.isFinite(parsedBase) && parsedBase > 0 ? { basePrice: Math.round(parsedBase * 100) } : {})
    };

    const fallbackActorRates = {
      GLOBAL: {
        bsf: (config.basePrice || 19900) / 100,
        unpaid: (config.videoBasePrice || 24900) / 100,
        ivr: (config.telephonyBasePrice || 8900) / 100,
        online: 100,
        podcast: 100,
        radio_national: 150,
        radio_regional: 100,
        radio_local: 75,
        tv_national: 250,
        tv_regional: 150,
        tv_local: 100,
        live_regie: (config.liveSessionSurcharge || 5000) / 100
      }
    };

    let usage: 'commercial' | 'unpaid' | 'telefonie' = 'unpaid';
    let commercialMediaType: CommercialMediaType | null = null;

    if (normalizedCategory === 'telephony') {
      usage = 'telefonie';
    } else if (normalizedCategory === 'e-learning') {
      usage = 'unpaid';
    } else if (normalizedCategory.startsWith('commercial')) {
      usage = 'commercial';
      const mediaMap: Record<string, CommercialMediaType> = {
        'commercial-local': 'radio_local',
        'commercial-national': 'radio_national',
        'commercial-international': 'tv_national'
      };
      const mediaTypeCandidate = String(mediaType || '').toLowerCase();
      commercialMediaType = (mediaTypeCandidate as CommercialMediaType) || mediaMap[normalizedCategory] || 'online';
    }

    const result = SlimmeKassa.calculate({
      usage,
      words: Number.isFinite(parsedDuration) && parsedDuration > 0 ? Math.round(parsedDuration) : undefined,
      mediaTypes: commercialMediaType ? [commercialMediaType] : [],
      country: normalizedMarket,
      countries: [normalizedMarket],
      spots: commercialMediaType ? { [commercialMediaType]: parsedSpots } : undefined,
      years: commercialMediaType ? { [commercialMediaType]: parsedYears } : undefined,
      actorRates: fallbackActorRates,
      isVatExempt: Boolean(hasVatNumber)
    }, config);

    return NextResponse.json({
      basePrice: ((config.basePrice || 0) / 100).toFixed(2),
      subtotal: result.subtotal.toFixed(2),
      vatAmount: result.vat.toFixed(2),
      total: result.total.toFixed(2),
      currency: 'EUR',
      engine: 'SlimmeKassa',
      deprecated: true,
      canonical_path: '/api/checkout/submit',
      is_quote_only: result.isQuoteOnly || false,
      quote_reason: result.quoteReason || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Pricing calculation failed' }, { status: 500 });
  }
}
