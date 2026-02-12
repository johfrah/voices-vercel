/**
 * ⚡ NUCLEAR PRICING ENGINE (2026)
 * 
 * Deze service berekent prijzen direct in TypeScript op basis van actor-data.
 * Pure logica, geen directe database afhankelijkheden om client-side gebruik te ondersteunen.
 */

export interface PricingResult {
  price: number;
  formatted: string;
  breakdown?: {
    base: number;
    usage_multiplier: number;
    word_surcharge: number;
    addons: number;
  };
}

export type UsageType = 'telefonie' | 'unpaid' | 'paid' | 'subscription';
export type PlanType = 'basic' | 'pro' | 'studio';
export type MediaChannel = 'online' | 'tv' | 'radio' | 'podcast';
export type Region = 'Nationaal' | 'Regionaal' | 'Lokaal';

export class PricingEngine {
  /**
   * Default fallback prijzen (Nuclear Fallback)
   */
  static getDefaultConfig() {
    return {
      unpaid_base: 239,
      johfrai_base: 49,
      ivr_base: 89,
      johfrai_prompt: 9.95,
      ivr_prompt: 19.95,
      johfrai_word: 0.50,
      ivr_word: 1.00,
      music_mix: 59,
      live_regie: 50,
      processing_fee: 0.10,
      vat_rate: 0.21,
      bulk_threshold: 750,
      bulk_johfrai: 450,
      bulk_ivr: 915.35,
      bulk_word_johfrai: 0.15,
      bulk_word_ivr: 0.25,
      entry_price_base: 9,
      entry_price_words: 20,
      entry_price_surcharge: 0.10,
      telephony_set_price: 89,
      telephony_set_messages: 8,
      telephony_set_words_per_message: 25,
      telephony_update_retainer: 19,
      plans: {
        basic: { price: 19, words: 500, yearly_words: 6000, languages: ['nl-be'], human_fix: 0 },
        pro: { price: 39, words: 1500, yearly_words: 18000, languages: ['nl-be', 'fr-be', 'en-gb'], human_fix: 1 },
        studio: { price: 99, words: 5000, yearly_words: 60000, languages: ['nl-be', 'fr-be', 'en-gb'], human_fix: 4 }
      }
    };
  }

  /**
   * De kern-rekenmethode (Vertaald uit voices_calculate_native_voice_price)
   */
  static calculatePrice(
    actorRates: Record<string, any>,
    params: {
      usage: UsageType;
      plan?: PlanType;
      media?: MediaChannel[];
      words?: number;
      prompts?: number;
      spots?: number;
      years?: number;
      liveRegie?: boolean;
      musicMix?: boolean;
      countries?: string[];
      tvRegion?: Region;
      radioRegion?: Region;
      useEntryPricing?: boolean;
    },
    config: Record<string, any> = PricingEngine.getDefaultConfig()
  ): PricingResult {
    const {
      usage,
      plan = 'basic',
      media = ['online'],
      words = 25,
      prompts = 1,
      spots = 1,
      years = 1,
      liveRegie = false,
      musicMix = false,
      countries = ['be'],
      tvRegion = 'Nationaal',
      radioRegion = 'Nationaal',
      useEntryPricing = false
    } = params;

    let totalPrice = 0;
    const primaryCountry = (countries[0] || 'be').toLowerCase();
    const isJohfrai = actorRates.first_name?.toLowerCase() === 'johfrah' && actorRates.ai_enabled;

    if (useEntryPricing && usage === 'telefonie') {
      const setPrice = config.telephony_set_price || 99;
      const setLimit = config.telephony_set_messages || 8;
      const wordLimit = config.telephony_set_words_per_message || 30;
      const extraMessagePrice = config.entry_price_base || 9;
      const extraWordPrice = config.entry_price_surcharge || 0.10;
      
      if (prompts === 1 && words <= wordLimit) {
        return {
          price: 0,
          formatted: 'Gratis Proevertje',
          breakdown: { base: 0, usage_multiplier: 1, word_surcharge: 0, addons: 0 }
        };
      }

      // Base price is the set
      totalPrice = setPrice;
      
      // Extra messages above the set limit
      if (prompts > setLimit) {
        totalPrice += (prompts - setLimit) * extraMessagePrice;
      }

      // Extra words per message
      const wordsPerPrompt = words / Math.max(1, prompts);
      if (wordsPerPrompt > wordLimit) {
        totalPrice += (wordsPerPrompt - wordLimit) * extraWordPrice * prompts;
      }
      
      if (musicMix) totalPrice += config.music_mix;
      
      const finalPrice = Math.round(totalPrice * 100) / 100;
      return {
        price: finalPrice,
        formatted: new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(finalPrice),
        breakdown: {
          base: setPrice,
          usage_multiplier: 1,
          word_surcharge: totalPrice - setPrice - (musicMix ? config.music_mix : 0),
          addons: musicMix ? config.music_mix : 0
        }
      };
    }

    if (usage === 'subscription') {
      const planConfig = config.plans[plan] || config.plans.basic;
      totalPrice = planConfig.price;
      
      return {
        price: totalPrice,
        formatted: new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(totalPrice),
        breakdown: {
          base: totalPrice,
          usage_multiplier: 1,
          word_surcharge: 0,
          addons: 0
        }
      };
    }

    // 1. Base Price Detection
    const countryRates = actorRates.rates?.[primaryCountry.toUpperCase()] || {};
    const globalRates = actorRates.rates?.['GLOBAL'] || {};

    if (usage === 'paid') {
      let basePrice = 0;
      for (const m of media) {
        let field = '';
        if (m === 'online') field = 'price_online_media';
        else if (m === 'podcast') field = 'price_podcast_preroll';
        else if (m === 'tv') {
          const suffix = tvRegion === 'Regionaal' ? '_regional' : (tvRegion === 'Lokaal' ? '_local' : '_national');
          field = `price_tv${suffix}`;
        } else if (m === 'radio') {
          const suffix = radioRegion === 'Regionaal' ? '_regional' : (radioRegion === 'Lokaal' ? '_local' : '_national');
          field = `price_radio${suffix}`;
        }

        if (field) {
          let mPrice = countryRates[field] || globalRates[field] || actorRates[field] || 0;
          basePrice = Math.max(basePrice, Number(mPrice));
        }
      }

      if (basePrice <= 0) return { price: 0, formatted: 'Op aanvraag' };

      const subtotal = basePrice * (1 + 0.5 * (spots - 1));
      totalPrice = subtotal * (1 + 0.5 * (years - 1));

    } else if (usage === 'unpaid') {
      // 🏛️ LEGACY TRUTH: Video (unpaid) tarieven zijn bij iedereen gelijk (€ 239)
      let basePrice = config.unpaid_base;
      totalPrice = basePrice;
      if (words > 200) {
        // 🏛️ LEGACY TRUTH: Na 200 woorden komt er 0.20 per woord bij (GEEN fee bij Video)
        totalPrice += (words - 200) * 0.20;
      }

    } else if (usage === 'telefonie') {
      // 🏛️ LEGACY TRUTH: Telefonie tarieven zijn bij iedereen gelijk (€ 89)
      let basePrice = isJohfrai 
        ? config.johfrai_base
        : config.ivr_base;
      
      const promptPrice = isJohfrai ? config.johfrai_prompt : config.ivr_prompt;
      const wordPrice = isJohfrai ? config.johfrai_word : config.ivr_word;
      
      // 🏛️ LEGACY TRUTH: Bulk korting vanaf 750 woorden
      if (words >= config.bulk_threshold) {
        totalPrice = (isJohfrai ? config.bulk_johfrai : config.bulk_ivr) + 
                    ((words - config.bulk_threshold) * (isJohfrai ? config.bulk_word_johfrai : config.bulk_word_ivr));
        
        // Bij bulk is de processing fee vaak al verwerkt of niet van toepassing op de basis
        // Maar we volgen de legacy code: fee over het totaal
        const processingFee = config.processing_fee || 0.10;
        totalPrice = totalPrice + (totalPrice * processingFee);
      } else if (words <= 25) {
        // 🏛️ LEGACY TRUTH: Tot 25 woorden is de prijs de basisprijs (89).
        totalPrice = basePrice;
      } else {
        const extraWords = words - 25;
        totalPrice = basePrice + (extraWords * wordPrice) + (prompts > 1 ? (prompts - 1) * promptPrice : 0);
        
        // 🏛️ LEGACY TRUTH: 10% Processing Fee over het totaal (alleen bij extra woorden)
        const processingFee = config.processing_fee || 0.10;
        totalPrice = totalPrice + (totalPrice * processingFee);
      }

      if (musicMix) {
        totalPrice += config.music_mix;
      }
      
      if (isJohfrai) {
        totalPrice = Math.max(49, totalPrice);
      }
    }

    if (liveRegie && usage === 'paid') {
      const regiePrice = Number(globalRates.price_live_regie || actorRates.price_live_regie || config.live_regie);
      totalPrice += regiePrice;
    }

    const finalPrice = Math.round(totalPrice * 100) / 100;

    return {
      price: finalPrice,
      formatted: new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(finalPrice),
      breakdown: {
        base: usage === 'telefonie' ? (isJohfrai ? config.johfrai_base : config.ivr_base) : 0,
        usage_multiplier: 1,
        word_surcharge: usage === 'telefonie' ? (totalPrice - (isJohfrai ? config.johfrai_base : config.ivr_base)) : 0,
        addons: musicMix ? config.music_mix : 0
      }
    };
  }

  static getPricingConfig() {
    return {
      countries: {
        BE: 'België',
        NL: 'Nederland',
        FR: 'Frankrijk',
        DE: 'Duitsland',
        UK: 'Verenigd Koninkrijk',
        US: 'Verenigde Staten',
        ES: 'Spanje',
        IT: 'Italië'
      },
      media_types: [
        { id: 'online', label: 'Online Media' },
        { id: 'radio', label: 'Radio' },
        { id: 'tv', label: 'TV' },
        { id: 'podcast', label: 'Podcast' }
      ],
      usage_types: [
        { id: 'unpaid', label: 'Corporate / E-learning' },
        { id: 'paid', label: 'Commercial' },
        { id: 'telefonie', label: 'Telefonie / IVR' },
        { id: 'subscription', label: 'Johfrai Abonnement' }
      ]
    };
  }
}
