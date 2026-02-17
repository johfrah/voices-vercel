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
export type CommercialMediaType = 'online' | 'tv_national' | 'radio_national' | 'podcast' | 'social_media' | 'tv_regional' | 'tv_local' | 'radio_regional' | 'radio_local';

export interface PricingConfig {
  basePrice: number;
  wordRate: number;
  vatRate: number;
  musicSurcharge: number;
  liveSessionSurcharge: number;
  aiDiscount?: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  basePrice: 249, //  NEW BSF (2026) - Charm Pricing
  wordRate: 0.25,
  vatRate: 0.21,
  musicSurcharge: 59,
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
  liveSession?: boolean; //  Extra fee for live session
  plan?: PlanType;
  isVatExempt?: boolean;
  actorRates?: Record<string, any>; //  Actor-specific rates from Supabase JSON
}

export interface PricingResult {
  base: number;
  wordSurcharge: number;
  mediaSurcharge: number;
  musicSurcharge: number;
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
    if (amount <= 0) return 0;
    
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
    let liveSessionSurcharge = 0;

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
      //  MARGE-PROTOCOL: De BSF van 249 (verkoop) is zo berekend dat de stemacteur 
      // exact 175 (inkoop) ontvangt. Onze marge is dus minimaal 74 per opdracht.
      const BSF = parseFloat(input.actorRates?.price_bsf || input.actorRates?.bsf || 249);
      
      const actorRates = input.actorRates || {};
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
      let uniqueChannels = new Set();

      selectedCountries.forEach(country => {
        const countryRates = actorRates[country] || {};
        const globalRates = actorRates['GLOBAL'] || actorRates['global'] || {};
        const nativeRates = actorRates[nativeCountry] || {};

        selectedMedia.forEach(m => {
          //  GLOBAL-FIRST LOOKUP:
          // Priority 1: Specifiek land (Uitzondering)
          // Priority 2: Global (Standaard)
          // Priority 3: Native land van de stem (Fallback)
          let fee = 0;
          if (countryRates[m] !== undefined) fee = parseFloat(countryRates[m]);
          else if (globalRates[m] !== undefined) fee = parseFloat(globalRates[m]);
          else if (nativeRates[m] !== undefined) fee = parseFloat(nativeRates[m]);
          
          //  KELLY'S FALLBACK: Als er echt niets gevonden wordt, gebruik de BSF als basis buyout
          if (fee === 0) {
            console.warn(`[PricingEngine] No rate found for ${m} in ${country}. Using BSF fallback.`);
            fee = BSF; 
          }

          //  BSF + BUYOUT SPLIT LOGICA
          let finalAllIn = this.charmRound(fee);

          //  STRATEGIC SPLIT (2026): Landcampagnes vs Kleine Campagnes
          const isSmallCampaign = m.includes('regional') || m.includes('local');
          
          if (isSmallCampaign) {
            //  REGIONAAL/LOKAAL: Fixed Price Model met 50% staffel op extra spots
            const spots = (input.spots && input.spots[m]) || 1;
            const smallCampaignStaffel = 1 + (0.50 * (spots - 1));
            totalBuyout += finalAllIn * smallCampaignStaffel;
          } else {
            //  LANDCAMPAGNES: BSF + Buyout (Klassiek)
            const baseBuyout = Math.max(0, finalAllIn - BSF);
            const spots = (input.spots && input.spots[m]) || 1;
            const years = (input.years && input.years[m]) || 1;
            
            let buyoutForType = 0;

            if (m === 'podcast') {
                const units = Math.max(1, years * 4); 
                buyoutForType = baseBuyout * (1 + 0.5 * (units - 1));
            } else if (m === 'online' || m === 'social_media') {
                let buyoutSum = baseBuyout; 
                if (spots > 1) {
                  const spots2to3 = Math.min(2, spots - 1);
                  buyoutSum += spots2to3 * (baseBuyout * 0.60);
                }
                if (spots > 3) {
                  const spots4plus = spots - 3;
                  buyoutSum += spots4plus * (baseBuyout * 0.50);
                }
                buyoutForType = buyoutSum;
            } else {
                const isSixMonths = years === 0.5;
                const yearMultiplier = isSixMonths ? 0.8 : (1 + (0.5 * (years - 1)));
                
                let buyoutSum = baseBuyout; 
                if (spots > 1) {
                  const spots2to3 = Math.min(2, spots - 1);
                  buyoutSum += spots2to3 * (baseBuyout * 0.60);
                }
                if (spots > 3) {
                  const spots4plus = spots - 3;
                  buyoutSum += spots4plus * (baseBuyout * 0.50);
                }
                buyoutForType = buyoutSum * yearMultiplier;
            }
            totalBuyout += buyoutForType;
          }
          
          // Track unique channels for channel discount
          uniqueChannels.add(`${country}_${m}`); 
        });
      });

      //  KANAAL-MIX KORTING (Multi-Land / Multi-Medium)
      let channelDiscount = 1;
      const totalItems = uniqueChannels.size;
      if (totalItems === 2) channelDiscount = 0.90; // 10% korting
      else if (totalItems >= 3) channelDiscount = 0.85; // 15% korting
      
      mediaSurcharge = totalBuyout * channelDiscount;

      //  BASE LOGIC
      const hasNationalCampaign = selectedMedia.some(m => !(m.includes('regional') || m.includes('local')));
      base = hasNationalCampaign ? BSF : 0;
    }

    let legalDisclaimer = "";
    if (input.usage === 'commercial') {
      const country = input.country || 'BE';
      if (country === 'BE') {
        legalDisclaimer = "Tarieven geldig voor uitzending in Belgi.";
      } else {
        legalDisclaimer = `Tarieven gebaseerd op uitzending in ${country}.`;
      }
    }

    // 2. Word/Prompt Surcharge (Journey-specific thresholds)
    if (input.usage === 'telefonie') {
      //  TELEFONIE LOGICA (LEGACY PORT 2026):
      // Gevonden in kelder/src/00-core/database/110-pricing-helpers.php
      const words = input.words || 0;
      const telephonyBase = 89;
      
      if (words === 0) {
        base = telephonyBase;
        wordSurcharge = 0;
      } else if (words <= 25) {
        // Eerste bericht (tot 25 woorden) is GRATIS in de set
        wordSurcharge = 0;
        base = telephonyBase;
      } else if (words >= 750) {
        base = 915.35;
        wordSurcharge = (words - 750) * 0.25;
      } else {
        const extraWordsPrice = (words - 25) * 1.00;
        const baseWithExtraWords = telephonyBase + extraWordsPrice;
        const processingFee = 19.95;
        const adminFee = baseWithExtraWords * 0.1;
        base = telephonyBase;
        wordSurcharge = extraWordsPrice + processingFee + adminFee;
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
      // 1. Check country-specific live_regie (e.g. rates.BE.live_regie)
      // 2. Check global live_regie (price_live_regie)
      // 3. Fallback to config default (50) ONLY if no data exists at all? No, user said "no fallback".
      // But we need a price for the service.
      
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
      // Usually live session has a cost. If 0, maybe it's included? Or not available?
      // Let's assume 0 means "Not set", so we might need a system default if the user wants one.
      // But user said "no fallback". So 0 it is.
      
      liveSessionSurcharge = fee;
    }

    // 4. Music Surcharge
    if (input.music?.asBackground || input.music?.asHoldMusic) {
      musicSurcharge = config.musicSurcharge;
    }

    const subtotal = base + wordSurcharge + mediaSurcharge + musicSurcharge + liveSessionSurcharge;
    const currentVatRate = input.isVatExempt ? 0 : config.vatRate;
    const vat = subtotal * currentVatRate;
    const total = subtotal + vat;

    return {
      base,
      wordSurcharge,
      mediaSurcharge,
      musicSurcharge,
      subtotal,
      vat,
      total,
      vatRate: currentVatRate,
      legalDisclaimer
    };
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

      const rates = actor.rates_raw || actor.rates || {};
      const countryRates = rates[country] || {};
      const globalRates = rates['GLOBAL'] || rates['global'] || {};
      const nativeLang = actor.nativeLang || actor.native_lang || 'nl-BE';
      const nativeCountry = nativeLang.split('-')[1]?.toUpperCase() || 'BE';
      const nativeRates = rates[nativeCountry] || {};

      for (const media of mediaTypes) {
        //  CHRIS-PROTOCOL: Global-First Lookup Hierarchy
        // Priority 1: Specifiek land
        // Priority 2: Global
        // Priority 3: Native land van de stem
        const specificPrice = countryRates[media] !== undefined ? countryRates[media] :
                             (globalRates[media] !== undefined ? globalRates[media] : nativeRates[media]);

        if (specificPrice === undefined || specificPrice === null || specificPrice === 0 || specificPrice === '0' || specificPrice === '') {
          return 'unavailable';
        }
      }

      return 'available';
    }

    /**
     * @deprecated Use getAvailabilityStatus
     */
    static isAvailable(actor: any, mediaTypes: CommercialMediaType[], country: string = 'BE'): boolean {
      return this.getAvailabilityStatus(actor, mediaTypes, country) === 'available';
    }

  /**
   * Formatteert een bedrag naar EUR string.
   */
  static format(amount: number): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
