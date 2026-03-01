/**
 *  SLIMME KASSA (2026)
 * 
 * Centraliseert alle prijsberekeningen voor Voices.
 * Doel: Single Source of Truth voor zowel frontend (100ms feedback) als backend (Mollie/Yuki).
 * 
 * CHRIS-PROTOCOL: Gebruikt intern 'Cents' (Integers) voor 100% nauwkeurigheid.
 * 
 * @lock-file
 * @author Kelly (Transaction Guardian)
 */

export type UsageType = 'unpaid' | 'telefonie' | 'subscription' | 'commercial' | 'non-commercial';
export type PlanType = 'basic' | 'pro' | 'studio';
export type CommercialMediaType = 'online' | 'tv_national' | 'radio_national' | 'podcast' | 'tv_regional' | 'tv_local' | 'radio_regional' | 'radio_local';

export class SlimmeKassaError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'SlimmeKassaError';
  }
}

export interface SlimmeKassaConfig {
  basePrice: number; // in cents
  videoBasePrice: number; // in cents
  telephonyBasePrice: number; // in cents
  telephonySetupFee: number; // in cents
  telephonyWordPrice: number; // in cents
  telephonyWordThreshold: number; // in words
  videoWordThreshold: number; // in words
  videoWordRate: number; // in cents
  telephonyBulkThreshold: number; // in words
  telephonyBulkBasePrice: number; // in cents
  telephonyBulkWordRate: number; // in cents
  telephonyFormulaAnchor?: number; // CHRIS-PROTOCOL: Anchor for watchdog integrity
  wordRate: number; // in cents (default fallback)
  vatRate: number; // as float (0.21)
  musicSurcharge: number; // in cents
  radioReadySurcharge: number; // in cents
  liveSessionSurcharge: number; // in cents
  academyPrice: number; // in cents
  workshopPrice: number; // in cents
  johfraiBasicPrice: number; // in cents
  johfraiProPrice: number; // in cents
  johfraiStudioPrice: number; // in cents
  aiDiscount?: number; // percentage
  wordsPerMinute: number; // Vlaamse standaard: 150-160 woorden per minuut
}

export const DEFAULT_KASSA_CONFIG: SlimmeKassaConfig = {
  basePrice: 19900, // €199 in cents (BSF)
  videoBasePrice: 24900, // €249 in cents
  telephonyBasePrice: 8900, // €89 in cents
  telephonySetupFee: 1995, // €19.95 in cents
  telephonyWordPrice: 100, // €1.00 in cents
  telephonyWordThreshold: 25, // in words
  videoWordThreshold: 200, // in words
  videoWordRate: 20, // €0.20 in cents
  telephonyBulkThreshold: 750, // in words
  telephonyBulkBasePrice: 91535, // €915.35 in cents
  telephonyBulkWordRate: 25, // €0.25 in cents
  telephonyFormulaAnchor: 8900, // CHRIS-PROTOCOL: Verankerde telefonie-formule integriteit
  wordRate: 20, // in cents (default fallback)
  vatRate: 0.21, // 21%
  musicSurcharge: 5900, // €59 in cents
  radioReadySurcharge: 0,
  liveSessionSurcharge: 5000, // €50 in cents
  academyPrice: 19900, // €199 in cents
  workshopPrice: 29500, // €295 in cents
  johfraiBasicPrice: 4900, // in cents
  johfraiProPrice: 9900, // in cents
  johfraiStudioPrice: 19900, // in cents
  wordsPerMinute: 155, // Vlaamse standaard blijft behouden
};

export interface SlimmeKassaInput {
  usage: UsageType;
  words?: number;
  prompts?: number;
  mediaTypes?: CommercialMediaType[];
  countries?: string[];
  country?: string;
  spots?: Record<string, number>;
  years?: Record<string, number>;
  music?: {
    asBackground?: boolean;
    asHoldMusic?: boolean;
  };
  radioReady?: boolean;
  liveSession?: boolean;
  secondaryLanguages?: string[];
  plan?: PlanType;
  isVatExempt?: boolean;
  actorRates?: Record<string, any>;
}

export interface SlimmeKassaResult {
  base: number; // in euros
  wordSurcharge: number; // in euros
  mediaSurcharge: number; // in euros
  mediaBreakdown?: Record<string, {
    subtotal: number; // in euros
    discount: number; // in euros
    final: number; // in euros
  }>;
  musicSurcharge: number; // in euros
  radioReadySurcharge: number; // in euros
  subtotal: number; // in euros
  vat: number; // in euros
  total: number; // in euros
  vatRate: number;
  legalDisclaimer?: string;
  isQuoteOnly?: boolean; // If true, price is an estimate and requires manual review
  quoteReason?: string; // Reason why manual review is needed
}

export class SlimmeKassa {
  /**
   * 🛡️ CHRIS-PROTOCOL: Journey to Usage Mapping (v2.16.134)
   * Centralizes the handshake between Journey IDs and Pricing Usage.
   */
  static getUsageFromJourneyId(journeyId: number | string): UsageType {
    const id = typeof journeyId === 'string' ? parseInt(journeyId) : journeyId;
    
    const map: Record<number, UsageType> = {
      26: 'telefonie',
      27: 'unpaid',
      28: 'commercial',
      1: 'subscription', // Studio
      30: 'subscription' // Academy
    };

    return map[id] || 'unpaid';
  }

  static getDefaultConfig(): SlimmeKassaConfig {
    return DEFAULT_KASSA_CONFIG;
  }

  /**
   * Helper om euro's naar centen te converteren (voorkomt float errors)
   */
  private static toCents(amount: number | string): number {
    const val = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(val)) return 0;
    return Math.round(val * 100);
  }

  /**
   * Helper om centen naar euro's te converteren
   */
  private static toEuros(cents: number): number {
    return cents / 100;
  }

  static calculatePrice(actor: any, input: any, config: SlimmeKassaConfig = DEFAULT_KASSA_CONFIG): { price: number; formatted: string } {
    try {
      const result = this.calculate({
        usage: input.usage,
        words: input.words,
        prompts: input.prompts,
        mediaTypes: input.media,
        country: input.countries?.[0],
        spots: { [input.media?.[0]]: input.spots },
        years: { [input.media?.[0]]: input.years },
        actorRates: actor.rates || actor
      }, config);

      return {
        price: result.total,
        formatted: this.format(result.total)
      };
    } catch (e) {
      return { price: 0, formatted: 'Op aanvraag' };
    }
  }

  /**
   * Berekent de volledige prijsopbouw op basis van input.
   */
  static calculate(input: SlimmeKassaInput, config: SlimmeKassaConfig = DEFAULT_KASSA_CONFIG): SlimmeKassaResult {
    const activeConfig = { ...DEFAULT_KASSA_CONFIG, ...config };
    let baseCents = 0;
    let wordSurchargeCents = 0;
    let mediaSurchargeCents = 0;
    let musicSurchargeCents = 0;
    let radioReadySurchargeCents = 0;
    let liveSessionSurchargeCents = 0;
    let legalDisclaimer = "";
    let isQuoteOnly = false;
    let quoteReason = "";
    
    const isSubscription = input.usage === 'subscription';
    const isWorkshop = (input as any).journey === 'studio' || (input as any).editionId;
    
    if (!input.actorRates && !isSubscription && !isWorkshop) {
      return {
        base: 0, wordSurcharge: 0, mediaSurcharge: 0, musicSurcharge: 0, radioReadySurcharge: 0,
        subtotal: 0, vat: 0, total: 0, vatRate: input.isVatExempt ? 0 : activeConfig.vatRate
      };
    }

    // 🛡️ CHRIS-PROTOCOL: ID-First Handshake (v2.16.137)
    // We prioritize JSONB rates via hard service IDs over legacy columns.
    const actor = input.actorRates || {};
    const rates = actor.rates?.rates || actor.rates || actor;
    const country = input.country || 'BE';
    const countryRates = rates[country] || {};
    const globalRates = rates['GLOBAL'] || rates['global'] || {};

    const getServicePrice = (serviceCode: string): number => {
      const val = countryRates[serviceCode] ?? globalRates[serviceCode];
      const serviceId = MarketManager.getServiceId(serviceCode);
      const isBuyoutType = serviceId ? MarketManager.getServiceType(serviceId) === 'buyout' : false;
      
      if (val !== undefined && val !== null && val !== '') {
        const cents = this.toCents(val);
        // 🛡️ CHRIS-PROTOCOL: If it's a buyout type, the value in DB is now the pure buyout (v2.16.140)
        return cents;
      }
      
      // Legacy column fallbacks (only if JSONB is missing)
      // Note: Legacy columns still store all-in prices, so we subtract BSF if needed
      const bsf = activeConfig.basePrice || 19900;
      if (serviceCode === 'ivr' && actor.price_ivr) return this.toCents(actor.price_ivr);
      if (serviceCode === 'unpaid' && (actor.price_unpaid || actor.price_unpaid_media)) return this.toCents(actor.price_unpaid || actor.price_unpaid_media);
      if (serviceCode === 'online' && actor.price_online) {
        const allIn = this.toCents(actor.price_online);
        return isBuyoutType ? Math.max(0, allIn - bsf) : allIn;
      }
      if (serviceCode === 'live_regie' && actor.price_live_regie) return this.toCents(actor.price_live_regie);
      if (serviceCode === 'bsf' && (actor.price_bsf || actor.bsf)) return this.toCents(actor.price_bsf || actor.bsf);
      
      return 0;
    };

    if (input.usage === 'commercial') {
      legalDisclaimer = country === 'BE' ? "Tarieven geldig voor uitzending in België." : `Tarieven gebaseerd op uitzending in ${country}.`;
    }

    // 1. Base Price Logic
    if (input.usage === 'subscription') {
      if (input.plan === 'pro') baseCents = activeConfig.johfraiProPrice || 9900;
      else if (input.plan === 'studio') baseCents = activeConfig.johfraiStudioPrice || 19900;
      else baseCents = activeConfig.johfraiBasicPrice || 4900;
      
      if ((input as any).journey === 'academy') {
        baseCents = activeConfig.academyPrice || 19900;
      }
    } else if (input.usage === 'telefonie') {
      // 🛡️ CHRIS-PROTOCOL: ID-First Handshake for Telephony (Service ID 2) - All-in
      baseCents = getServicePrice('ivr');
      if (baseCents === 0) {
        baseCents = activeConfig.telephonyBasePrice || 8900;
      }
    } else if (input.usage === 'commercial') {
      // 🛡️ CHRIS-PROTOCOL: ID-First Handshake for BSF (Service ID 4)
      let BSF_Cents = getServicePrice('bsf');
      if (BSF_Cents === 0) BSF_Cents = activeConfig.basePrice || 19900;
      
      if (BSF_Cents === 0) {
        return {
          base: 0, wordSurcharge: 0, mediaSurcharge: 0, musicSurcharge: 0, radioReadySurcharge: 0,
          subtotal: 0, vat: 0, total: 0, vatRate: input.isVatExempt ? 0 : activeConfig.vatRate,
          isQuoteOnly: true,
          quoteReason: "Geen basis-uurtarief (BSF) gevonden voor deze acteur."
        };
      }

      const selectedCountries = input.countries || [country];
      const selectedMedia = [...(input.mediaTypes || [])];
      if (selectedMedia.length === 0) selectedMedia.push('online');

      let totalBuyoutCents = 0;
      let mediaBreakdown: Record<string, { subtotal: number; discount: number; final: number }> = {};

      selectedMedia.forEach(m => {
        // 🛡️ CHRIS-PROTOCOL: ID-First Handshake for Media Buyouts (Service IDs 5-15)
        const serviceId = MarketManager.getServiceId(m);
        const isBuyoutType = serviceId ? MarketManager.getServiceType(serviceId) === 'buyout' : false;
        let feeCents = getServicePrice(m);

        if (feeCents === 0) {
          isQuoteOnly = true;
          quoteReason = `Geen specifiek tarief gevonden voor mediatype '${m}' in ${country}.`;
          
          if (m === 'online') {
            feeCents = getServicePrice('online') || 10000; // Default €100 buyout for online
          }
        }

        let buyoutForTypeCents = 0;
        const isSmallCampaign = m.includes('regional') || m.includes('local') || m === 'podcast' || country === 'BE-REGIONAL';

        if (!isBuyoutType || isSmallCampaign) {
          // All-in types (Podcast, Regional, Local)
          const spots = (input.spots && input.spots[m]) || 1;
          const years = (input.years && input.years[m]) || 1;
          
          // 🛡️ CHRIS-PROTOCOL: Podcast 3-month rule (v2.16.140)
          // If it's a podcast, 'years' actually means '3-month periods'
          buyoutForTypeCents = feeCents * spots * years;
        } else {
          // Buyout types (BSF + Pure Buyout)
          const spots = (input.spots && input.spots[m]) || 1;
          const years = (input.years && input.years[m]) || 1;
          const pureBuyoutCents = feeCents;
          
          // 🛡️ CHRIS-PROTOCOL: Minimum buyout protection
          const effectivePureBuyoutCents = Math.max(10000, pureBuyoutCents);
          buyoutForTypeCents = Math.round(effectivePureBuyoutCents * spots * years);
        }
        
        totalBuyoutCents += buyoutForTypeCents;
        mediaBreakdown[m] = { 
          subtotal: this.toEuros(buyoutForTypeCents), 
          discount: 0, 
          final: this.toEuros(buyoutForTypeCents) 
        };
      });

      mediaSurchargeCents = totalBuyoutCents;
      const hasBuyoutCampaign = selectedMedia.some(m => {
        const sid = MarketManager.getServiceId(m);
        return sid && MarketManager.getServiceType(sid) === 'buyout' && !m.includes('regional') && !m.includes('local');
      });
      
      baseCents = hasBuyoutCampaign ? BSF_Cents : 0;

      if (input.liveSession) {
        liveSessionSurchargeCents = getServicePrice('live_regie') || activeConfig.liveSessionSurcharge;
      }

      const subtotalCents = baseCents + wordSurchargeCents + mediaSurchargeCents + musicSurchargeCents + radioReadySurchargeCents + liveSessionSurchargeCents;
      const currentVatRate = input.isVatExempt ? 0 : activeConfig.vatRate;
      const vatCents = Math.round(subtotalCents * currentVatRate);
      
      return {
        base: this.toEuros(baseCents),
        wordSurcharge: this.toEuros(wordSurchargeCents),
        mediaSurcharge: this.toEuros(mediaSurchargeCents),
        mediaBreakdown,
        musicSurcharge: this.toEuros(musicSurchargeCents),
        radioReadySurcharge: 0,
        subtotal: this.toEuros(subtotalCents),
        vat: this.toEuros(vatCents),
        total: this.toEuros(subtotalCents + vatCents),
        vatRate: currentVatRate,
        legalDisclaimer,
        isQuoteOnly,
        quoteReason
      };
    }

    // 2. Word/Prompt Surcharge (Telephony & Unpaid)
    if (input.usage === 'telefonie') {
      const words = input.words || 0;
      const telephonyBaseCents = getServicePrice('ivr') || activeConfig.telephonyBasePrice || 8900;
      
      const setupFeeCents = activeConfig.telephonySetupFee || 1995;
      const wordPriceCents = activeConfig.telephonyWordPrice || 100;
      
      if (words <= (activeConfig.telephonyWordThreshold || 25) && !input.music?.asBackground && !input.music?.asHoldMusic) {
        baseCents = telephonyBaseCents;
        wordSurchargeCents = 0;
      } else if (words >= (activeConfig.telephonyBulkThreshold || 750)) {
        baseCents = activeConfig.telephonyBulkBasePrice || 91535; 
        wordSurchargeCents = (words - (activeConfig.telephonyBulkThreshold || 750)) * (activeConfig.telephonyBulkWordRate || 25);
      } else {
        const threshold = (activeConfig.telephonyWordThreshold || 25);
        const extraWords = Math.max(0, words - threshold);
        const wordSurchargeValCents = extraWords * wordPriceCents;
        const subtotalForFeeCents = telephonyBaseCents + wordSurchargeValCents;
        
        const hasExtraWords = words > threshold;
        const processingFeeCents = hasExtraWords ? Math.round(subtotalForFeeCents * (activeConfig.processing_fee || 0.10)) : 0;
        const effectiveSetupFeeCents = hasExtraWords ? setupFeeCents : 0;
        
        const totalWithoutMusicCents = subtotalForFeeCents + effectiveSetupFeeCents + processingFeeCents;
        baseCents = telephonyBaseCents;
        wordSurchargeCents = totalWithoutMusicCents - telephonyBaseCents;
      }
    } else if (input.usage === 'unpaid') {
      // 🛡️ CHRIS-PROTOCOL: ID-First Handshake for Video (Service ID 3)
      baseCents = getServicePrice('unpaid') || activeConfig.videoBasePrice || 24900;
      
      if (input.words && input.words > (activeConfig.videoWordThreshold || 200)) {
        wordSurchargeCents = (input.words - (activeConfig.videoWordThreshold || 200)) * (activeConfig.videoWordRate || activeConfig.wordRate || 20);
      }
    }

    if (input.liveSession) {
      liveSessionSurchargeCents = getServicePrice('live_regie') || activeConfig.liveSessionSurcharge;
    }

    if (input.music?.asBackground || input.music?.asHoldMusic) {
      if (input.usage === 'telefonie') {
        musicSurchargeCents = activeConfig.musicSurcharge;
      }
    }

    const subtotalCents = baseCents + wordSurchargeCents + mediaSurchargeCents + musicSurchargeCents + radioReadySurchargeCents + liveSessionSurchargeCents;
    const currentVatRate = input.isVatExempt ? 0 : activeConfig.vatRate;
    const vatCents = Math.round(subtotalCents * currentVatRate);

    return {
      base: this.toEuros(baseCents),
      wordSurcharge: this.toEuros(wordSurchargeCents),
      mediaSurcharge: this.toEuros(mediaSurchargeCents),
      musicSurcharge: this.toEuros(musicSurchargeCents),
      radioReadySurcharge: 0,
      subtotal: this.toEuros(subtotalCents),
      vat: this.toEuros(vatCents),
      total: this.toEuros(subtotalCents + vatCents),
      vatRate: currentVatRate,
      legalDisclaimer,
      isQuoteOnly,
      quoteReason
    };
  }

  static getAvailabilityStatus(actor: any, mediaTypes: CommercialMediaType[], country: string = 'BE'): 'available' | 'unavailable' {
    if (!mediaTypes || mediaTypes.length === 0) return 'available';

    // CHRIS-PROTOCOL: Ensure rates is a valid object
    let rates = actor.rates?.rates || actor.rates || actor.rates_raw || actor;
    if (typeof rates === 'string') {
      try {
        rates = JSON.parse(rates);
      } catch (e) {
        rates = actor;
      }
    }

    const countryRates = (rates && typeof rates === 'object') ? (rates[country] || {}) : {};
    const globalRates = (rates && typeof rates === 'object') ? (rates['GLOBAL'] || rates['global'] || {}) : {};
    
    const nativeLang = actor.native_lang || actor.native_lang || 'nl-BE';
    const nativeCountry = nativeLang.split('-')[1]?.toUpperCase() || 'BE';
    const nativeRates = (rates && typeof rates === 'object') ? (rates[nativeCountry] || {}) : {};

    const getFee = (val: any) => {
      if (val === undefined || val === null || val === '') return 0;
      const num = parseFloat(String(val));
      return isNaN(num) ? 0 : num;
    };

    const isAvailable = mediaTypes.every(m => {
      let fee = 0;
      
      // 🛡️ CHRIS-PROTOCOL: Global-First Mandate
      // We check Global first because land-specific prices are exceptions.
      // If an actor has a Global price, they are available everywhere unless explicitly blocked.
      
      // 1. Check Global first (Standard)
      fee = getFee(globalRates[m]);
      
      // 2. Check Country specific (Exception)
      if (fee === 0) fee = getFee(countryRates[m]);
      
      // 3. Check Native country
      if (fee === 0) fee = getFee(nativeRates[m]);
      
      // 4. Legacy keys fallback (Specific to this mediatype)
      if (fee === 0) {
        const legacyKey = `price_${m}`;
        fee = getFee(rates[legacyKey] || actor[legacyKey]);
      }

      // 🛡️ CHRIS-PROTOCOL: Final Recovery for common types
      // If it's a standard type like 'online', we check if they have ANY commercial price at all.
      // We explicitly check price_online (Commercial Online) or price_bsf (Commercial Base).
      // We do NOT fall back to price_unpaid (Organic Video) here to respect the commercial/organic split.
      if (fee === 0 && m === 'online') {
        fee = getFee(actor.price_online || actor.price_bsf || actor.bsf || 0);
      }

      // 🛡️ USER-MANDATE: If a country is selected, we only check if they have specific prices.
      // If they don't have a specific price for that country, they are still 'available' 
      // via their Global rates. We only return false if BOTH Global and Country rates are 0.
      const available = fee > 0 || getFee(globalRates[m]) > 0;
      
      if (!available) {
        console.log(`[SlimmeKassa] Media ${m} NOT available for actor ${actor.id}. Fee: ${fee}, Global: ${getFee(globalRates[m])}`);
      }
      
      return available;
    });

    return isAvailable ? 'available' : 'unavailable';
  }

  static isAvailable(actor: any, mediaTypes: CommercialMediaType[], country: string = 'BE'): boolean {
    return this.getAvailabilityStatus(actor, mediaTypes, country) === 'available';
  }

  static format(amount: number, locale: string = 'nl-BE', currency: string = 'EUR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }
}
