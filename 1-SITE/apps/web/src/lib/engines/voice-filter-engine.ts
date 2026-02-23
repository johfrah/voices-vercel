/**
 * VOICE FILTER ENGINE (2026)
 * 
 * De onverwoestbare basishoeksteen van het Voices ecosysteem.
 * Centraliseert alle filter-logica om inconsistenties tussen frontend en backend te elimineren.
 * 
 * CHRIS-PROTOCOL: 
 * - Zwart-wit discipline: Een acteur is beschikbaar of niet.
 * - 100ms feedback: Geoptimaliseerd voor client-side filtering op grote datasets.
 * - Antifragile: Kan omgaan met zowel ISO-codes als UI-labels.
 * 
 * @lock-file
 */

import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { Actor } from '@/types';
import { SlimmeKassa, CommercialMediaType } from './pricing-engine';

export interface FilterCriteria {
  journey?: 'telephony' | 'video' | 'commercial';
  language?: string | null;
  languageId?: number | null; //  Harde ID matching
  languages?: string[];
  languageIds?: number[]; //  Harde ID matching voor multi-lang
  gender?: string | null;
  media?: string[];
  country?: string;
  countryId?: number | null; //  Harde ID matching
  toneIds?: number[]; //  Harde ID matching voor styles
  sortBy?: 'popularity' | 'delivery' | 'alphabetical' | 'alphabetical_az' | 'alphabetical_za';
  currentStep?: string;
  selectedActorId?: number;
}

export class VoiceFilterEngine {
  // 1. JOURNEY & AVAILABILITY (Korneel Mandate)
  static filter(actors: Actor[], criteria: FilterCriteria): Actor[] {
    if (!actors || actors.length === 0) return [];

    console.log(`[VoiceFilterEngine] Starting filter with ${actors.length} actors. Journey: ${criteria.journey}`, { 
      language: criteria.language,
      languageId: criteria.languageId,
      media: criteria.media,
      country: criteria.country
    });

    let result = [...actors];

    // 1. JOURNEY & AVAILABILITY (Korneel Mandate)
    if (criteria.journey === 'commercial' && Array.isArray(criteria.media) && criteria.media.length > 0) {
      const selectedMedia = criteria.media as CommercialMediaType[];
      const country = criteria.country || 'BE';

      result = result.filter(actor => {
        // CHRIS-PROTOCOL: Behoud de geselecteerde acteur in de script-stap, zelfs als filters wijzigen
        if (criteria.selectedActorId === actor.id && criteria.currentStep === 'script') {
          return true;
        }

        const isAvailable = SlimmeKassa.isAvailable(actor, selectedMedia, country);
        
        // 🛡️ USER-MANDATE: We filter NOOIT stemmen weg op basis van land-beschikbaarheid.
        // Alle stemmen zijn normaal beschikbaar voor elk land. Land-specifieke prijzen
        // zijn uitzonderingen die de prijs updaten, niet de zichtbaarheid.
        // We loggen het wel voor admin-inzicht.
        if (!isAvailable) {
          // console.log(`[VoiceFilterEngine] Actor ${actor.display_name} would be filtered out for ${selectedMedia.join(', ')} in ${country}, but we keep them visible per USER-MANDATE.`);
        }
        return true; // Altijd beschikbaar houden
      });
    }

    console.log(`[VoiceFilterEngine] After availability filter: ${result.length} actors`);

    // 2. STRICT NATIVE LANGUAGE MATCHING (ID-First Mandate 2026)
    if (criteria.languageId != null) {
      result = result.filter(actor => actor.native_lang_id != null && actor.native_lang_id === criteria.languageId);
    } else if (criteria.language && criteria.language !== 'all') {
      // CHRIS-PROTOCOL: Fallback to label matching if ID is missing (Legacy/Initial Load)
      const lowLang = criteria.language.toLowerCase();
      const dbCode = MarketManager.getLanguageCode(lowLang).toLowerCase();
      
      result = result.filter(actor => {
        const actorNative = actor.native_lang?.toLowerCase();
        const actorNativeLabel = actor.native_lang_label?.toLowerCase();
        const actorExtraLangs = (actor.extra_langs || '').toLowerCase().split(',').map(l => l.trim());
        
        // 🛡️ CHRIS-PROTOCOL: NATIVE OR EXTRA LOGIC (Gids-niet-Grens)
        // Als een bezoeker filtert op een specifieke taal (bijv. fr-be), 
        // tonen we iedereen die deze taal beheerst (Native of Extra).
        // Dit voorkomt dat we stemmen ontzeggen die de taal wel spreken.
        const isNativeMatch = (
          actorNative === dbCode || 
          actorNative === lowLang || 
          actorNativeLabel === lowLang ||
          this.isLanguageVariationMatch(dbCode, actorNative)
        );

        const isExtraMatch = actorExtraLangs.some(el => 
          el === dbCode || 
          el === lowLang || 
          (dbCode.startsWith('fr-') && (el === 'fr' || el === 'frans' || el === 'french')) ||
          (dbCode.startsWith('en-') && (el === 'en' || el === 'engels' || el === 'english')) ||
          (dbCode.startsWith('de-') && (el === 'de' || el === 'duits' || el === 'german')) ||
          (dbCode.startsWith('nl-') && (el === 'nl' || el === 'nederlands' || el === 'dutch')) ||
          this.isLanguageVariationMatch(dbCode, el)
        );

        return isNativeMatch || isExtraMatch;
      });
    }

    console.log(`[VoiceFilterEngine] After language filter: ${result.length} actors`);

    // 3. MULTI-LANGUAGE (Telephony specific - ID-First)
    if (criteria.journey === 'telephony' && (criteria.languageIds && criteria.languageIds.length > 1 || criteria.languages && criteria.languages.length > 1)) {
      if (criteria.languageIds && criteria.languageIds.length > 1) {
        const selectedIds = criteria.languageIds;
        result = result.filter(actor => {
          // Moedertaal moet de eerste ID zijn
          if (actor.native_lang_id == null || actor.native_lang_id !== selectedIds[0]) return false;
          
          // Moet alle andere IDs in extra_lang_ids hebben
          const actorExtras = actor.extra_lang_ids || [];
          return selectedIds.slice(1).every(id => actorExtras.includes(id));
        });
      } else if (criteria.languages && criteria.languages.length > 1) {
        const selectedLangs = criteria.languages.map(l => l.toLowerCase());
        
        result = result.filter(actor => {
          // Voor multi-lang telefonie moet de moedertaal de EERSTE geselecteerde taal zijn
          const primaryLang = selectedLangs[0];
          const primaryCode = MarketManager.getLanguageCode(primaryLang).toLowerCase();
          const actorNative = actor.native_lang?.toLowerCase();

          const isNativeOfPrimary = 
            actorNative === primaryCode || 
            actorNative === primaryLang ||
            this.isLanguageVariationMatch(primaryCode, actorNative);

          if (!isNativeOfPrimary) return false;

          // De acteur moet ALLE geselecteerde talen spreken (native + extra)
          const actorAllLangs = [
            actor.native_lang,
            ...(actor.extra_langs ? actor.extra_langs.split(',').map(l => l.trim()) : [])
          ].filter(Boolean).map(l => l.toLowerCase());

          return selectedLangs.every(lang => {
            const code = MarketManager.getLanguageCode(lang).toLowerCase();
            const short = lang.split('-')[0];
            
            return actorAllLangs.some(al => 
              al === code || al === lang || al === short || al.includes(code) || al.includes(short)
            );
          });
        });
      }
    }

    // 4. STYLE / TONE FILTERING (ID-First Mandate 2026)
    if (criteria.toneIds && criteria.toneIds.length > 0) {
      result = result.filter(actor => {
        const actorTones = actor.tone_ids || [];
        return criteria.toneIds!.every(id => actorTones.includes(id));
      });
    } else if (criteria.style) {
      const lowStyle = criteria.style.toLowerCase();
      result = result.filter(actor => {
        const actorTones = actor.tone_of_voice?.toLowerCase() || '';
        return actorTones.includes(lowStyle);
      });
    }

    // 5. COUNTRY FILTERING (ID-First)
    if (criteria.countryId != null) {
      result = result.filter(actor => actor.country_id != null && actor.country_id === criteria.countryId);
    }

    // 6. GENDER
    if (criteria.gender && criteria.gender !== 'Iedereen' && criteria.gender !== 'Everyone') {
      const lowGender = criteria.gender.toLowerCase();
      result = result.filter(actor => {
        const g = actor.gender?.toLowerCase() || '';
        if (lowGender.includes('man')) return g === 'male' || g === 'mannelijk';
        if (lowGender.includes('vrouw')) return g === 'female' || g === 'vrouwelijk';
        return true;
      });
    }

    // 5. SORTING
    return this.sort(result, criteria.sortBy || 'popularity');
  }

  /**
   * Helper voor taal-variaties (bijv. 'nl-be' matcht met 'vlaams')
   */
  private static isLanguageVariationMatch(targetCode: string, actorLang?: string): boolean {
    if (!actorLang) return false;
    const al = actorLang.toLowerCase();
    
    // 🛡️ CHRIS-PROTOCOL: EXTRA-LANG LOGIC (Bob-methode)
    // Een extra taal is nooit landgebonden. Als iemand 'Frans' spreekt als extra taal, 
    // matcht dat met zowel 'fr-be' als 'fr-fr'.
    const isGeneralFrench = (al === 'frans' || al === 'fr' || al === 'french');
    const isGeneralEnglish = (al === 'engels' || al === 'en' || al === 'english');
    const isGeneralGerman = (al === 'duits' || al === 'de' || al === 'german');
    const isGeneralDutch = (al === 'nederlands' || al === 'nl' || al === 'dutch');

    if (targetCode.startsWith('fr-') && isGeneralFrench) return true;
    if (targetCode.startsWith('en-') && isGeneralEnglish) return true;
    if (targetCode.startsWith('de-') && isGeneralGerman) return true;
    if (targetCode.startsWith('nl-') && isGeneralDutch) return true;

    // Vlaams/Nederlands cross-matching
    if (targetCode === 'nl-be' && (al === 'vlaams' || al === 'nl-be')) return true;
    if (targetCode === 'nl-nl' && (al === 'nederlands' || al === 'nl-nl')) return true;
    
    // Frans variaties
    if (targetCode === 'fr-fr' && (al === 'frans' || al === 'fr-fr')) return true;
    if (targetCode === 'fr-be' && (al === 'frans (be)' || al === 'fr-be')) return true;
    
    // Engels variaties
    if (targetCode === 'en-gb' && (al === 'engels' || al === 'en-gb')) return true;
    if (targetCode === 'en-us' && (al === 'engels (us)' || al === 'en-us')) return true;

    // Gedeeltelijke matches (bijv. 'nl-be' matcht met 'nl-be-accent')
    if (al.startsWith(targetCode + '-') || targetCode.startsWith(al + '-')) return true;

    return false;
  }

  /**
   * Sorteer logica volgens Chris-Protocol (Nuclear Sorting 2026)
   */
  static sort(actors: Actor[], sortBy: FilterCriteria['sortBy']): Actor[] {
    return [...actors].sort((a, b) => {
      switch (sortBy) {
        case 'delivery':
          return (a.delivery_days_min || 1) - (b.delivery_days_min || 1);
        case 'alphabetical':
        case 'alphabetical_az':
          return (a.display_name || '').localeCompare(b.display_name || '');
        case 'alphabetical_za':
          return (b.display_name || '').localeCompare(a.display_name || '');
        case 'popularity':
        default:
          // 1. menu_order (Admin override)
          // CHRIS-PROTOCOL: menu_order is the absolute override. 0 means no override (lowest priority).
          const aOrder = a.menu_order || 999999;
          const bOrder = b.menu_order || 999999;
          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }

          // 1.5 Market-Aware Language Priority (Bob-methode)
          // CHRIS-PROTOCOL: If no manual order, prioritize market-specific languages.
          const market = MarketManager.getCurrentMarket();
          const primaryLang = market.primary_language.toLowerCase();
          
          const getLangScore = (actor: Actor) => {
            const actorNative = (actor.native_lang_label || actor.native_lang || '').toLowerCase();
            
            // 1. Primary Language of the market
            if (actorNative === primaryLang) return 1;
            
            // 2. English (Global standard)
            if (actorNative === 'engels' || actorNative === 'en-gb' || actorNative === 'en-us') return 2;
            
            // 3. Market-specific secondary priorities
            if (market.market_code === 'BE') {
              if (actorNative === 'nederlands') return 3;
              if (actorNative === 'frans') return 4;
              if (actorNative === 'duits') return 5;
            } else if (market.market_code === 'NLNL') {
              if (actorNative === 'vlaams') return 3;
              if (actorNative === 'duits') return 4;
              if (actorNative === 'frans') return 5;
            }
            
            return 100;
          };

          const langScoreA = getLangScore(a);
          const langScoreB = getLangScore(b);
          if (langScoreA !== langScoreB) return langScoreA - langScoreB;

          // 2. delivery_date_min_priority (Nuclear Speed Priority)
          // CHRIS-PROTOCOL: High priority actors (e.g. Christina) should appear first.
          const aSpeedPrio = a.delivery_date_min_priority || 0;
          const bSpeedPrio = b.delivery_date_min_priority || 0;
          if (aSpeedPrio !== bSpeedPrio) {
            return bSpeedPrio - aSpeedPrio;
          }

          // 3. delivery_date_min (Actual availability)
          if (a.delivery_date_min && b.delivery_date_min) {
            const aDate = new Date(a.delivery_date_min).getTime();
            const bDate = new Date(b.delivery_date_min).getTime();
            if (aDate !== bDate) {
              return aDate - bDate;
            }
          }

          // 4. total_sales (Natural popularity)
          // CHRIS-PROTOCOL: High sales means high popularity.
          const aSales = a.total_sales || 0;
          const bSales = b.total_sales || 0;
          if (aSales !== bSales) {
            return bSales - aSales; // Meer sales eerst
          }

          // 5. voice_score (Legacy popularity / Admin boost)
          const aScore = a.voice_score || 0;
          const bScore = b.voice_score || 0;
          if (aScore !== bScore) {
            return bScore - aScore; // Hogere score eerst
          }

          // 6. Alphabetical (Tie-breaker)
          // CHRIS-PROTOCOL: If scores are equal, we sort by first name.
          return (a.first_name || a.display_name || '').localeCompare(b.first_name || b.display_name || '');
      }
    });
  }
}
