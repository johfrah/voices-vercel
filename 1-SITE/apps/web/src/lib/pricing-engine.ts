/**
 *  PRICING ENGINE (2026)
 * 
 * Centraliseert alle prijsberekeningen voor Voices.
 * Doel: Single Source of Truth voor zowel frontend (100ms feedback) als backend (Mollie/Yuki).
 * 
 * @author Kelly (Transaction Guardian)
 */

export type UsageType = 'unpaid' | 'telefonie' | 'subscription' | 'commercial' | 'non-commercial';
export type PlanType = 'basic' | 'pro' | 'studio';
export type CommercialMediaType = 'online' | 'tv_national' | 'radio_national' | 'podcast' | 'tv_regional' | 'tv_local' | 'radio_regional' | 'radio_local';

export interface PricingConfig {
  basePrice: number;
  wordRate: number;
  vatRate: number;
  musicSurcharge: number;
  radioReadySurcharge: number;
  liveSessionSurcharge: number;
  aiDiscount?: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  basePrice: 199, //  NEW BSF (2026) - Sally's Mandate (reduced from 249)
  wordRate: 0.25,
  vatRate: 0.21,
  musicSurcharge: 59,
  radioReadySurcharge: 49,
  liveSessionSurcharge: 99, //  Charm Pricing
};

export interface PricingInput {
  usage: UsageType;
  words?: number;
  prompts?: number;
  mediaTypes?: CommercialMediaType[]; //  Support multiple media types
  countries?: string[]; //  Support multiple countries
  country?: string;
  spots?: Record<string, number>; //  Spots per media type
  years?: Record<string, number>; //  Duration per media type
  music?: {
    asBackground?: boolean;
    asHoldMusic?: boolean;
  };
    radioReady?: boolean; //  Extra fee for mastering (REMOVED 2026)
    liveSession?: boolean; //  Extra fee for live session
    plan?: PlanType;
    isVatExempt?: boolean;
    actorRates?: Record<string, any>; //  Actor-specific rates from Supabase JSON
}

export interface PricingResult {
  base: number;
  wordSurcharge: number;
  mediaSurcharge: number;
  mediaBreakdown?: Record<string, {
    subtotal: number;
    discount: number;
    final: number;
  }>; // Enhanced breakdown with discounts
  musicSurcharge: number;
  radioReadySurcharge: number; // Keep for type safety but set to 0
  subtotal: number;
  vat: number;
  total: number;
  vatRate: number;
  legalDisclaimer?: string; //  Legal disclaimer for pricing (e.g. valid for BE)
}

export class PricingEngine {
  static getDefaultConfig(): PricingConfig {
    return DEFAULT_PRICING_CONFIG;
  }

  static calculatePrice(actor: any, input: any): { price: number; formatted: string } {
    const result = this.calculate({
      usage: input.usage,
      words: input.words,
      prompts: input.prompts,
      mediaTypes: input.media,
      country: input.countries?.[0],
      spots: { [input.media?.[0]]: input.spots },
      years: { [input.media?.[0]]: input.years },
      actorRates: actor.rates || actor
    });

    return {
      price: result.total,
      formatted: this.format(result.total)
    };
  }

  /**
   *  CHARM ROUNDING (2026)
   * Trekt bedragen naar de dichtstbijzijnde '9' trede.
   * Regel: 150 -> 149, 250 -> 249, 450 -> 449.
   * Uitzondering: Bedragen < 100 gaan ALTIJD OMHOOG naar de volgende '9' (bijv. 40 -> 49).
   */
  static charmRound(amount: number): number {
    if (isNaN(amount) || amount <= 0) return 0;
    
    if (amount < 100) {
      // ALTIJD OMHOOG voor bedragen < 100
      return Math.ceil(amount / 10) * 10 - 1;
    }

    // DICHTSTBIJZIJNDE voor bedragen >= 100
    const base10 = Math.round(amount / 10) * 10;
    return base10 - 1;
  }

  /**
   * Berekent de volledige prijsopbouw op basis van input.
   */
  static calculate(input: PricingInput, config: PricingConfig = DEFAULT_PRICING_CONFIG): PricingResult {
    let base = config.basePrice;
    let wordSurcharge = 0;
    let mediaSurcharge = 0;
    let musicSurcharge = 0;
    let radioReadySurcharge = 0;
    let liveSessionSurcharge = 0;
    let legalDisclaimer = "";
    
    //  KELLY-MANDATE: If no actor is selected and it's not a subscription or workshop, price is 0.
    const isSubscription = input.usage === 'subscription';
    const isWorkshop = (input as any).journey === 'studio' || (input as any).editionId;
    
    if (!input.actorRates && !isSubscription && !isWorkshop) {
      return {
        base: 0,
        wordSurcharge: 0,
        mediaSurcharge: 0,
        musicSurcharge: 0,
        radioReadySurcharge: 0,
        subtotal: 0,
        vat: 0,
        total: 0,
        vatRate: input.isVatExempt ? 0 : config.vatRate
      };
    }

    if (input.usage === 'commercial') {
      const country = input.country || 'BE';
      if (country === 'BE') {
        legalDisclaimer = "Tarieven geldig voor uitzending in België.";
      } else {
        legalDisclaimer = `Tarieven gebaseerd op uitzending in ${country}.`;
      }
    }

    // 1. Base Price Logic based on Journey/Usage
    if (input.usage === 'subscription') {
      if (input.plan === 'pro') base = 49;
      else if (input.plan === 'studio') base = 99;
      else base = 29;
    } else if (input.usage === 'telefonie') {
      base = 89; // Speciaal tarief voor telefonie
    } else if (input.usage === 'commercial') {
      //  COMMERCIAL LOGICA (2026): BSF + Buyout Model
      //  CHRIS-PROTOCOL: Global-First Architectuur.
      //  MARGE-PROTOCOL: De BSF van 199 (verkoop) is zo berekend dat de stemacteur 
      // exact 140 (inkoop) ontvangt. Onze marge is dus minimaal 59 per opdracht.
      const rates = input.actorRates?.rates?.rates || input.actorRates?.rates || input.actorRates || {};
      const globalRatesForBSF = rates['GLOBAL'] || rates['global'] || {};
      
      //  KELLY-MANDATE: BSF should never be 0 for commercial usage. Fallback to 199.
      let BSF = parseFloat(globalRatesForBSF.bsf || input.actorRates?.price_bsf || input.actorRates?.bsf || '199');
      if (isNaN(BSF) || BSF <= 0) BSF = 199;
      
      //  CHRIS-PROTOCOL: Support both full actor object and rates JSON
      const selectedCountries = input.countries || [input.country || 'BE'];
      const nativeLang = (input.actorRates as any)?.nativeLang || (input.actorRates as any)?.native_lang || 'nl-BE';
      const nativeCountry = nativeLang.split('-')[1]?.toUpperCase() || 'BE';

      const selectedMedia = input.mediaTypes || [];
      
      //  KELLY'S RECOVERY: Als er geen media is geselecteerd voor een commercial, 
      // vallen we terug op 'online' om 0-euro prijzen te voorkomen.
      if (selectedMedia.length === 0) {
        selectedMedia.push('online');
      }

      let totalBuyout = 0;
      let mediaBreakdown: Record<string, { subtotal: number; discount: number; final: number }> = {};

      selectedCountries.forEach(country => {
        const countryRates = rates[country] || {};
        const globalRates = rates['GLOBAL'] || rates['global'] || {};
        const nativeRates = rates[nativeCountry] || {};

        //  CHRIS-PROTOCOL: Channel Discount Logic (REMOVED 2026)
        // Elke extra spot of kanaal telt voor 100%.
        const channelDiscountFactor = 1;

        selectedMedia.forEach(m => {
          //  CHRIS-PROTOCOL: Global-First Lookup
          // Priority 1: Specifiek land (Uitzondering)
          // Priority 2: Global (Standaard)
          // Priority 3: Native land van de stem (Gegarandeerde bron)
          let fee = 0;
          if (countryRates[m] !== undefined) fee = parseFloat(countryRates[m]);
          else if (globalRates[m] !== undefined) fee = parseFloat(globalRates[m]);
          else if (nativeRates[m] !== undefined) fee = parseFloat(nativeRates[m]);
          
          //  CHRIS-PROTOCOL: Legacy Bridge (Check price_ prefix and root level)
          if (fee === 0 || isNaN(fee)) {
            const legacyKey = `price_${m}`;
            if (rates[legacyKey] !== undefined) fee = parseFloat(rates[legacyKey]);
            else if (input.actorRates?.[legacyKey] !== undefined) fee = parseFloat(input.actorRates[legacyKey]);
          }

          //  KELLY'S VALIDATION: Als er echt niets gevonden wordt, gebruik de BSF als basis
          if (fee === 0) {
            console.warn(`[PricingEngine] No rate found for ${m} in ${country}. Using BSF as base.`);
            fee = BSF; 
          }

          //  BSF + BUYOUT SPLIT LOGICA
          let finalAllIn = this.charmRound(fee);

          //  STRATEGIC SPLIT (2026): Landcampagnes vs Kleine Campagnes
          const isSmallCampaign = m.includes('regional') || m.includes('local') || m === 'podcast';
          let buyoutForType = 0;

          if (isSmallCampaign) {
            //  REGIONAAL/LOKAAL/PODCAST: Fixed Price Model
            //  BSF is hier 0 omdat het in de totaalprijs zit voor kleine campagnes
            //  CHRIS-PROTOCOL (2026): Géén staffelkortingen meer. Elke spot telt voor 100%.
            const spots = (input.spots && input.spots[m]) || 1;
            buyoutForType = finalAllIn * spots;
          } else {
            //  LANDCAMPAGNES: BSF + Buyout (Klassiek)
            //  CHRIS-PROTOCOL: Calculate the extra buyout amount.
            //  If the rate is higher than BSF, the buyout is the difference.
            //  If the rate is equal to or lower than BSF, the buyout is 0 (included in BSF).
            
            //  KELLY-MANDATE: Buyout is always based on the BSF.
            //  If the voice actor has a higher BSF, the buyout is calculated relative to that.
            const baseBuyout = Math.max(0, finalAllIn - BSF);
            const spots = (input.spots && input.spots[m]) || 1;
            const years = (input.years && input.years[m]) || 1;
            
            if (m === 'online') {
                const yearMultiplier = years === 0.5 ? 0.8 : (1 + (0.5 * (years - 1)));
                
                //  KELLY-MANDATE (2026): Minimum buyout voor Online is €100 per spot (Sally's Mandate: +50 higher than before).
                const effectiveBaseBuyout = Math.max(100, baseBuyout);
                
                //  CHRIS-PROTOCOL (2026): Géén staffelkortingen meer. 
                //  Elke extra spot kost de volledige buyout (100%).
                let buyoutSum = effectiveBaseBuyout * spots; 
                
                buyoutForType = buyoutSum * yearMultiplier;
            } else {
                // TV / RADIO NATIONAL
                const yearMultiplier = years === 0.5 ? 0.8 : (1 + (0.5 * (years - 1)));
                
                //  KELLY-MANDATE (2026): Minimum buyout voor Nationaal is €100 per spot (Sally's Mandate: +50 higher than before).
                const effectiveBaseBuyout = Math.max(100, baseBuyout);
                
                //  CHRIS-PROTOCOL (2026): Géén staffelkortingen meer.
                let buyoutSum = effectiveBaseBuyout * spots; 
                
                buyoutForType = buyoutSum * yearMultiplier;
            }
          }
          
          const finalPriceForType = buyoutForType * channelDiscountFactor;
          const combinationDiscount = buyoutForType - finalPriceForType;
          
          totalBuyout += finalPriceForType;
          
          if (!mediaBreakdown[m]) {
            mediaBreakdown[m] = { subtotal: 0, discount: 0, final: 0 };
          }
          // CHRIS-PROTOCOL: subtotal here is the price for this channel INCLUDING multiple spots/years
          // but BEFORE combination discount.
          mediaBreakdown[m].subtotal += buyoutForType;
          mediaBreakdown[m].discount += combinationDiscount;
          mediaBreakdown[m].final += finalPriceForType;
        });
      });

      mediaSurcharge = totalBuyout;

      //  BASE LOGIC
      //  CHRIS-PROTOCOL: If only small campaigns (regional/local) are selected, BSF is 0
      //  because their rates are all-in. If any national/global campaign is selected,
      //  we charge the BSF once.
      const hasNationalCampaign = selectedMedia.some(m => !(m.includes('regional') || m.includes('local')));
      base = hasNationalCampaign ? BSF : 0;

      //  LIVE SESSION & MUSIC (Added to commercial flow)
      if (input.liveSession) {
          const country = input.country || 'BE';
          const rates = (input.actorRates as any)?.[country] || {};
          let fee = 0;
          if (rates['live_regie'] > 0) fee = parseFloat(rates['live_regie']);
          else if (input.actorRates?.price_live_regie > 0) fee = parseFloat(input.actorRates?.price_live_regie);
          else if (input.actorRates?.['price_live_regie'] > 0) fee = parseFloat(input.actorRates?.['price_live_regie']);
          liveSessionSurcharge = fee;
      }

      if (input.music?.asBackground || input.music?.asHoldMusic) {
          musicSurcharge = config.musicSurcharge;
      }

      radioReadySurcharge = 0; //  REMOVED 2026

      const subtotal = base + wordSurcharge + mediaSurcharge + musicSurcharge + radioReadySurcharge + liveSessionSurcharge;
      const currentVatRate = input.isVatExempt ? 0 : config.vatRate;
      
      return {
        base,
        wordSurcharge,
        mediaSurcharge,
        mediaBreakdown,
        musicSurcharge,
        radioReadySurcharge,
        subtotal,
        vat: subtotal * currentVatRate,
        total: subtotal + (subtotal * currentVatRate),
        vatRate: currentVatRate,
        legalDisclaimer
      };
    }

    // 2. Word/Prompt Surcharge (Journey-specific thresholds)
    if (input.usage === 'telefonie') {
      //  TELEFONIE LOGICA (LEGACY PORT 2026):
      // Gevonden in kelder/src/00-core/database/110-pricing-helpers.php
      const words = input.words || 0;
      const prompts = input.prompts || 1;
      const telephonyBase = 89;
      
      if (words <= 25 && prompts <= 1) {
        base = telephonyBase;
        wordSurcharge = 0;
      } else if (words >= 750) {
        base = 915.35;
        wordSurcharge = (words - 750) * 0.25;
      } else {
        // CHRIS-PROTOCOL: Explicit prompt-based pricing
        const extraPrompts = Math.max(0, prompts - 1);
        const extraWords = Math.max(0, words - 25);
        
        const promptSurcharge = extraPrompts * 19.95; 
        const wordSurchargeVal = extraWords * 1.00;
        
        base = telephonyBase;
        wordSurcharge = this.charmRound(promptSurcharge + wordSurchargeVal);
      }
    } else if (input.usage === 'unpaid') {
      //  VIDEO (NON-COMMERCIAL): 249 base (incl. 200w), daarna 0.20 per woord
      //  CHRIS-PROTOCOL: Minimum price is 249. Use actor specific unpaid price if it's higher.
      const actorUnpaidPrice = Math.max(249, Number(input.actorRates?.price_unpaid_media || input.actorRates?.unpaid || 249));
      base = this.charmRound(actorUnpaidPrice);
      if (input.words && input.words > 200) {
        wordSurcharge = (input.words - 200) * 0.20;
      }
    }

    // 3. Live Session Surcharge
    if (input.liveSession) {
      //  CHRIS-PROTOCOL: Strict Lookup
    //  CHRIS-PROTOCOL: Guaranteed Source Lookup
    // 1. Check country-specific live_regie (e.g. rates.BE.live_regie)
    // 2. Check global live_regie (price_live_regie)
    // 3. No system default allowed - must be explicit data.
    
    const country = input.country || 'BE';
    const rates = (input.actorRates as any)?.[country] || {};
    
    let fee = 0;
    
    // Try country specific first
    if (rates['live_regie'] > 0) {
        fee = parseFloat(rates['live_regie']);
    } 
    // Try global base column
    else if (input.actorRates?.price_live_regie > 0) {
        fee = parseFloat(input.actorRates?.price_live_regie);
    }
    // Try legacy key in root
    else if (input.actorRates?.['price_live_regie'] > 0) {
        fee = parseFloat(input.actorRates?.['price_live_regie']);
    }
    
    // If fee is found, use it. If not, it is 0 (unavailable/free?).
    // Usually live session has a cost. If 0, it means "Not set" in DB.
    
    liveSessionSurcharge = fee;
    }

    // 4. Music Surcharge
    if (input.music?.asBackground || input.music?.asHoldMusic) {
      musicSurcharge = config.musicSurcharge;
    }

    // 5. Radio Ready Surcharge (REMOVED 2026)
    radioReadySurcharge = 0;

    const subtotal = base + wordSurcharge + mediaSurcharge + musicSurcharge + radioReadySurcharge + liveSessionSurcharge;
    const currentVatRate = input.isVatExempt ? 0 : config.vatRate;
    const vat = subtotal * currentVatRate;
    const total = subtotal + vat;

    // CHRIS-PROTOCOL: Final result construction
    const result: PricingResult = {
      base,
      wordSurcharge,
      mediaSurcharge,
      musicSurcharge,
      radioReadySurcharge,
      subtotal,
      vat,
      total, // Keep total as subtotal + vat for backend/Mollie
      vatRate: currentVatRate,
      legalDisclaimer
    };

    return result;
  }

    //  KORNEEL RULE: Centralized Availability Logic
    // Bepaalt of een stem beschikbaar is voor de gevraagde media types.
    // 
    // Regels (2026 Mandate):
    // 1. Prijs > 0 -> BESCHIKBAAR (Toon stem)
    // 2. Prijs = 0, undefined, null of leeg -> NIET BESCHIKBAAR (Verberg stem)
    // 
    // @returns 'available' | 'unavailable'
    static getAvailabilityStatus(actor: any, mediaTypes: CommercialMediaType[], country: string = 'BE'): 'available' | 'unavailable' {
      //  CHRIS-PROTOCOL: If no specific media types are requested (e.g. telephony or video journey), 
      // the actor is available by default as long as they are live.
      if (!mediaTypes || mediaTypes.length === 0) return 'available';

    const rates = actor.rates?.rates || actor.rates || actor.rates_raw || actor;
    const countryRates = rates[country] || {};
    const globalRates = rates['GLOBAL'] || rates['global'] || {};
    const nativeLang = rates.nativeLang || rates.native_lang || actor.native_lang || 'nl-BE';
    const nativeCountry = nativeLang.split('-')[1]?.toUpperCase() || 'BE';
    const nativeRates = rates[nativeCountry] || {};

    //  CHRIS-PROTOCOL: Debug availability
    // console.log(`[PricingEngine] Checking availability for ${actor.display_name || actor.firstName}. Media:`, mediaTypes, "Country:", country, "Rates keys:", Object.keys(rates));

    // Check if ALL requested media types have a price > 0
    const isAvailable = mediaTypes.every(m => {
      let fee = 0;
      if (countryRates[m] !== undefined) fee = parseFloat(countryRates[m]);
      else if (globalRates[m] !== undefined) fee = parseFloat(globalRates[m]);
      else if (nativeRates[m] !== undefined) fee = parseFloat(nativeRates[m]);
      
      // Bridge for legacy keys if directly on actor/rates
      if (fee === 0 || isNaN(fee)) {
        const legacyKey = `price_${m}`;
        if (rates[legacyKey] !== undefined) fee = parseFloat(rates[legacyKey]);
        else if (actor[legacyKey] !== undefined) fee = parseFloat(actor[legacyKey]);
      }

      //  KELLY-MANDATE: If it's a small campaign (regional/local), we also check if the voice has a general price_online or price_unpaid as fallback
      if (fee === 0 && (m.includes('regional') || m.includes('local'))) {
        const fallbackKeys = ['online', 'unpaid'];
        for (const fb of fallbackKeys) {
          if (countryRates[fb] !== undefined) fee = parseFloat(countryRates[fb]);
          else if (globalRates[fb] !== undefined) fee = parseFloat(globalRates[fb]);
          if (fee > 0) break;
        }
      }

      //  KELLY-MANDATE: If it's a national campaign, we also check if the voice has a general price_online as fallback
      if (fee === 0 && m.includes('national')) {
        const fb = 'online';
        if (countryRates[fb] !== undefined) fee = parseFloat(countryRates[fb]);
        else if (globalRates[fb] !== undefined) fee = parseFloat(globalRates[fb]);
      }

      const isAvailableForThisMedia = fee > 0;
      // console.log(`[PricingEngine] Availability for ${m}:`, isAvailableForThisMedia, "Fee:", fee);
      return isAvailableForThisMedia;
    });

      return isAvailable ? 'available' : 'unavailable';
    }

    /**
     * Legacy helper for availability check
     */
    static isAvailable(actor: any, mediaTypes: CommercialMediaType[], country: string = 'BE'): boolean {
      return this.getAvailabilityStatus(actor, mediaTypes, country) === 'available';
    }

  /**
   * Formatteert een bedrag als Euro string.
   */
  static format(amount: number): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
