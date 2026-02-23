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

    if (input.usage === 'commercial') {
      const country = input.country || 'BE';
      legalDisclaimer = country === 'BE' ? "Tarieven geldig voor uitzending in België." : `Tarieven gebaseerd op uitzending in ${country}.`;
    }

    // 1. Base Price Logic
    if (input.usage === 'subscription') {
      if (input.plan === 'pro') baseCents = activeConfig.johfraiProPrice || 9900;
      else if (input.plan === 'studio') baseCents = activeConfig.johfraiStudioPrice || 19900;
      else baseCents = activeConfig.johfraiBasicPrice || 4900;
      
      // Academy specific price override if journey is academy
      if ((input as any).journey === 'academy') {
        baseCents = activeConfig.academyPrice || 19900;
      }
    } else if (input.usage === 'telefonie') {
      const rates = input.actorRates?.rates?.rates || input.actorRates?.rates || input.actorRates || {};
      const country = input.country || 'BE';
      const countryRates = rates[country] || {};
      const globalRates = rates['GLOBAL'] || rates['global'] || {};
      
      // CHRIS-PROTOCOL: JSON-first waterfall for Telephony base price
      const jsonPrice = countryRates.ivr || globalRates.ivr;
      baseCents = jsonPrice ? this.toCents(jsonPrice) : (activeConfig.telephonyBasePrice || this.toCents(activeConfig.ivr_base) || 0);
    } else if (input.usage === 'commercial') {
      const rates = input.actorRates?.rates?.rates || input.actorRates?.rates || input.actorRates || {};
      const globalRatesForBSF = rates['GLOBAL'] || rates['global'] || {};
      
      // CHRIS-PROTOCOL: Actor BSF is leading. If not in DB, it falls back to global config.
      let BSF_Cents = this.toCents(globalRatesForBSF.bsf || input.actorRates?.price_bsf || input.actorRates?.bsf || (activeConfig.basePrice || this.toCents(activeConfig.entry_price_base) || 0) / 100);
      
      if (BSF_Cents === 0 && input.usage === 'commercial') {
        // console.warn(`[SlimmeKassa] No BSF found for actor or platform. Calculation blocked.`);
        return {
          base: 0, wordSurcharge: 0, mediaSurcharge: 0, musicSurcharge: 0, radioReadySurcharge: 0,
          subtotal: 0, vat: 0, total: 0, vatRate: input.isVatExempt ? 0 : activeConfig.vatRate,
          isQuoteOnly: true,
          quoteReason: "Geen basis-uurtarief (BSF) gevonden voor deze acteur."
        };
      }

      const selectedCountries = input.countries || [input.country || 'BE'];
      const nativeLang = (input.actorRates as any)?.nativeLang || (input.actorRates as any)?.native_lang || 'nl-BE';
      const nativeCountry = nativeLang.split('-')[1]?.toUpperCase() || 'BE';
      const selectedMedia = [...(input.mediaTypes || [])];
      
      if (selectedMedia.length === 0) selectedMedia.push('online');

      let totalBuyoutCents = 0;
      let mediaBreakdown: Record<string, { subtotal: number; discount: number; final: number }> = {};

      selectedCountries.forEach(country => {
        const countryRates = rates[country] || {};
        const globalRates = rates['GLOBAL'] || rates['global'] || {};
        const nativeRates = rates[nativeCountry] || {};

        selectedMedia.forEach(m => {
          let feeCents = 0;
          
          // 1. Check Global first (Standard)
          feeCents = this.toCents(globalRates[m]);
          
          // 2. Check Country specific (Exception)
          if (feeCents === 0) feeCents = this.toCents(countryRates[m]);
          
          // 3. Check Native country
          if (feeCents === 0) feeCents = this.toCents(nativeRates[m]);
          
          // 🛡️ CHRIS-PROTOCOL: Regional fallback for BE
          if (feeCents === 0 && country === 'BE-REGIONAL') {
            const regionalKey = m.replace('_national', '_regional');
            feeCents = this.toCents(globalRates[regionalKey] || countryRates[regionalKey] || nativeRates[regionalKey]);
          }
          
          // 4. Legacy keys fallback (Specific to this mediatype)
          if (feeCents === 0) {
            const legacyKey = `price_${m}`;
            feeCents = this.toCents(rates[legacyKey] || input.actorRates?.[legacyKey]);
          }

          // CHRIS-PROTOCOL: If fee is still 0, the actor is NOT available for this mediatype.
          // We no longer fallback to BSF or other types to respect the actor's opt-out.
          if (feeCents === 0) {
            // console.warn(`[SlimmeKassa] No rate found for ${m} in ${country} or GLOBAL. Actor has opted out.`);
            isQuoteOnly = true;
            quoteReason = `Geen specifiek tarief gevonden voor mediatype '${m}' in ${country}.`;
            
            // 🛡️ CHRIS-PROTOCOL: Final Recovery for common types in calculation
            // This ensures that IF an actor is already in the checkout (e.g. via direct link),
            // we still show a price based on their commercial fields instead of 0.
            // We explicitly do NOT use price_unpaid (Organic Video) here.
            if (m === 'online') {
              feeCents = this.toCents(input.actorRates?.price_online || input.actorRates?.price_bsf || input.actorRates?.bsf || 0);
            }
          }

          let finalAllInCents = feeCents; 
          const isSmallCampaign = m.includes('regional') || m.includes('local') || m === 'podcast' || country === 'BE-REGIONAL';
          let buyoutForTypeCents = 0;

          if (isSmallCampaign) {
            const spots = (input.spots && input.spots[m]) || 1;
            buyoutForTypeCents = finalAllInCents * spots;
          } else {
            const baseBuyoutCents = Math.max(0, finalAllInCents - BSF_Cents);
            const spots = (input.spots && input.spots[m]) || 1;
            const years = (input.years && input.years[m]) || 1;
            
            // NUCLEAR LOGIC: 2 spots = 2x buyout (Lineair)
            const effectiveBaseBuyoutCents = Math.max(10000, baseBuyoutCents); // €100 min
            const yearMultiplier = years; // Linear multiplier (1 year = 1x, 2 years = 2x, etc.)
            
            buyoutForTypeCents = Math.round(effectiveBaseBuyoutCents * spots * yearMultiplier);
          }
          
          totalBuyoutCents += buyoutForTypeCents;
          
          if (!mediaBreakdown[m]) {
            mediaBreakdown[m] = { subtotal: 0, discount: 0, final: 0 };
          }
          mediaBreakdown[m].subtotal += this.toEuros(buyoutForTypeCents);
          mediaBreakdown[m].final += this.toEuros(buyoutForTypeCents);
        });
      });

      mediaSurchargeCents = totalBuyoutCents;
      const hasNationalCampaign = selectedMedia.some(m => !(m.includes('regional') || m.includes('local')));
      baseCents = hasNationalCampaign ? BSF_Cents : 0;

      if (input.liveSession) {
          const country = input.country || 'BE';
          const countryRates = (input.actorRates as any)?.[country] || {};
          let feeCents = 0;
          if (countryRates['live_regie'] > 0) feeCents = this.toCents(countryRates['live_regie']);
          else if (input.actorRates?.price_live_regie > 0) feeCents = this.toCents(input.actorRates?.price_live_regie);
          liveSessionSurchargeCents = feeCents; // No global fallback for live session
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
      const rates = input.actorRates?.rates?.rates || input.actorRates?.rates || input.actorRates || {};
      const country = input.country || 'BE';
      const countryRates = rates[country] || {};
      const globalRates = rates['GLOBAL'] || rates['global'] || {};
      
      // CHRIS-PROTOCOL: JSON-first waterfall for Telephony base price
      const jsonPrice = countryRates.ivr || globalRates.ivr;
      const telephonyBaseCents = jsonPrice ? this.toCents(jsonPrice) : (activeConfig.telephonyBasePrice || this.toCents(89) || 0);
      
      if (telephonyBaseCents === 0 && input.usage === 'telefonie') {
        // console.warn(`[SlimmeKassa] No Telephony base price found in config. Calculation blocked.`);
        return {
          base: 0, wordSurcharge: 0, mediaSurcharge: 0, musicSurcharge: 0, radioReadySurcharge: 0,
          subtotal: 0, vat: 0, total: 0, vatRate: input.isVatExempt ? 0 : activeConfig.vatRate,
          isQuoteOnly: true,
          quoteReason: "Geen basis-tarief voor telefonie gevonden."
        };
      }

      const setupFeeCents = activeConfig.telephonySetupFee || this.toCents(19.95) || 0;
      const wordPriceCents = activeConfig.telephonyWordPrice || this.toCents(1) || 0;
      
      if (words <= (activeConfig.telephonyWordThreshold || 25) && !input.music?.asBackground && !input.music?.asHoldMusic) {
        baseCents = telephonyBaseCents;
        wordSurchargeCents = 0;
      } else if (words >= (activeConfig.telephonyBulkThreshold || 750)) {
        baseCents = activeConfig.telephonyBulkBasePrice || this.toCents(915.35) || 0; 
        wordSurchargeCents = (words - (activeConfig.telephonyBulkThreshold || 750)) * (activeConfig.telephonyBulkWordRate || this.toCents(0.25) || 0);
      } else {
        const threshold = (activeConfig.telephonyWordThreshold || 25);
        const extraWords = Math.max(0, words - threshold);
        const wordSurchargeValCents = extraWords * wordPriceCents;
        const subtotalForFeeCents = telephonyBaseCents + wordSurchargeValCents;
        
      // CHRIS-PROTOCOL: Fees only apply if words > threshold
      const hasExtraWords = words > threshold;
      const processingFeeCents = hasExtraWords ? Math.round(subtotalForFeeCents * (activeConfig.processing_fee || 0.10)) : 0;
      const effectiveSetupFeeCents = hasExtraWords ? setupFeeCents : 0;
      
      const totalWithoutMusicCents = subtotalForFeeCents + effectiveSetupFeeCents + processingFeeCents;
        baseCents = telephonyBaseCents;
        wordSurchargeCents = totalWithoutMusicCents - telephonyBaseCents;
      }
    } else     if (input.usage === 'unpaid') {
      const rates = input.actorRates?.rates?.rates || input.actorRates?.rates || input.actorRates || {};
      const country = input.country || 'BE';
      const countryRates = rates[country] || {};
      const globalRates = rates['GLOBAL'] || rates['global'] || {};

      // CHRIS-PROTOCOL: JSON-first waterfall for Video (Unpaid) price
      const jsonPrice = countryRates.unpaid || globalRates.unpaid;
      const actorUnpaidPrice = jsonPrice 
        ? parseFloat(String(jsonPrice))
        : Number(input.actorRates?.price_unpaid || input.actorRates?.price_unpaid_media || input.actorRates?.unpaid || (activeConfig.videoBasePrice || this.toCents(activeConfig.unpaid_base) || 0) / 100);
      
      baseCents = this.toCents(actorUnpaidPrice); 
      
      if (baseCents === 0 && input.usage === 'unpaid') {
        // console.warn(`[SlimmeKassa] No Video price found for actor or platform. Calculation blocked.`);
        return {
          base: 0, wordSurcharge: 0, mediaSurcharge: 0, musicSurcharge: 0, radioReadySurcharge: 0,
          subtotal: 0, vat: 0, total: 0, vatRate: input.isVatExempt ? 0 : activeConfig.vatRate,
          isQuoteOnly: true,
          quoteReason: "Geen basis-tarief voor video gevonden."
        };
      }

      if (input.words && input.words > (activeConfig.videoWordThreshold || 200)) {
        wordSurchargeCents = (input.words - (activeConfig.videoWordThreshold || 200)) * (activeConfig.videoWordRate || activeConfig.wordRate || 20); // Gebruik videoWordRate uit config
      }
    }

    if (input.liveSession) {
      const country = input.country || 'BE';
      const countryRates = (input.actorRates as any)?.[country] || {};
      let feeCents = 0;
      if (countryRates['live_regie'] > 0) feeCents = this.toCents(countryRates['live_regie']);
      else if (input.actorRates?.price_live_regie > 0) feeCents = this.toCents(input.actorRates?.price_live_regie);
      liveSessionSurchargeCents = feeCents; // No global fallback for live session
    }

    if (input.music?.asBackground || input.music?.asHoldMusic) {
      if (input.usage === 'telefonie') {
        musicSurchargeCents = activeConfig.musicSurcharge;
      } else {
        console.warn(`[SlimmeKassa] Music surcharge requested for usage type '${input.usage}', but music is now restricted to telephony.`);
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
    
    const nativeLang = actor.native_lang || actor.nativeLang || 'nl-BE';
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
      return fee > 0 || getFee(globalRates[m]) > 0;
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
