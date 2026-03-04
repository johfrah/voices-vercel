/**
 * STEMMENFILTER (2026)
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

import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";
import { Actor } from '@/types';

export interface FilterCriteria {
  journey?: 'telephony' | 'video' | 'commercial';
  language?: string | null;
  languageId?: number | null; //  Harde ID matching
  languages?: string[];
  languageIds?: number[]; //  Harde ID matching voor multi-lang
  gender?: string | null;
  genderId?: number | null; // 🛡️ Handshake Truth
  media?: string[];
  mediaIds?: number[]; // 🛡️ Handshake Truth
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

    // 🛡️ CHRIS-PROTOCOL: Handshake Truth Registry Access (v2.14.740)
    // We use MarketManager as the primary source, falling back to global/window for engines.
    const langRegistry = MarketManager.languages || (typeof window !== 'undefined' ? (window as any).handshakeLanguages : (typeof global !== 'undefined' ? (global as any).handshakeLanguages : [])) || [];
    const mediaRegistry = (typeof window !== 'undefined' ? (window as any).handshakeMediaTypes : (typeof global !== 'undefined' ? (global as any).handshakeMediaTypes : [])) || [];

    // console.log(`[VoiceFilter] Starting filter with ${actors.length} actors. Journey: ${criteria.journey}`, { 
    //   languageId: criteria.languageId,
    //   mediaIds: criteria.mediaIds,
    //   countryId: criteria.countryId
    // });

    let result = [...actors];

    // 1. JOURNEY & AVAILABILITY (Korneel Mandate)
    if (criteria.journey === 'commercial') {
      const mediaIds = criteria.mediaIds || [];
      const mediaCodes = criteria.media || [];
      
      // Resolve IDs to codes if needed for SlimmeKassa
      const selectedMediaCodes = new Set<string>(mediaCodes);
      if (mediaIds.length > 0 && mediaRegistry.length > 0) {
        mediaIds.forEach(id => {
          const match = mediaRegistry.find((m: any) => m.id === id);
          if (match) selectedMediaCodes.add(match.code);
        });
      }

      result = result.filter(actor => {
        // CHRIS-PROTOCOL: Behoud de geselecteerde acteur in de script-stap
        if (criteria.selectedActorId === actor.id && criteria.currentStep === 'script') {
          return true;
        }

        // 🛡️ CHRIS-PROTOCOL: Quote-First Commercial Visibility (v2.28.10)
        // Commercial country/media keuze bepaalt pricing, niet zichtbaarheid in de grid.
        // Als een stem geen direct tarief heeft, blijft die zichtbaar en valt checkout terug op quote-only.
        return true;
      });
    }

    // 2. STRICT NATIVE LANGUAGE MATCHING (ID-First Mandate 2026)
    // 🛡️ CHRIS-PROTOCOL: Use languageId (singular) OR languageIds[0] (v2.28.1)
    const effectiveLangId = criteria.languageId ?? (criteria.languageIds && criteria.languageIds.length === 1 ? criteria.languageIds[0] : null);
    if (effectiveLangId != null) {
      result = result.filter(actor => {
        // 🛡️ CHRIS-PROTOCOL: NATIVE-ONLY LOGIC (v2.14.740)
return actor.native_lang_id === effectiveLangId || actor.native_language_id === effectiveLangId;
      });
    }

    // 3. MULTI-LANGUAGE (Telephony specific - ID-First)
    if (criteria.journey === 'telephony' && criteria.languageIds && criteria.languageIds.length > 1) {
      const selectedIds = criteria.languageIds;
      result = result.filter(actor => {
        const actorAny = actor as any;
        // Moedertaal moet de eerste ID zijn
        if ((actor.native_lang_id || actorAny.native_language_id) !== selectedIds[0]) return false;
        
        // Moet alle andere IDs in extra_lang_ids hebben
        const actorExtras = actor.extra_lang_ids || [];
        return selectedIds.slice(1).every(id => actorExtras.includes(id));
      });
    }

    // 4. STYLE / TONE FILTERING (ID-First Mandate 2026)
    if (criteria.toneIds && criteria.toneIds.length > 0) {
      result = result.filter(actor => {
        const actorTones = actor.tone_ids || [];
        return criteria.toneIds!.every(id => actorTones.includes(id));
      });
    }

    // 5. COUNTRY FILTERING (ID-First)
    // 🛡️ COMMERCIAL-MANDATE: In commercial flow, country impacts pricing only (not visibility).
    // Non-commercial flows keep strict country filtering.
    if (criteria.countryId != null && criteria.journey !== 'commercial') {
      result = result.filter(actor => {
        const actorCountryId = actor.country_id || (actor as any).countryId;
        return actorCountryId == null || actorCountryId === criteria.countryId;
      });
    }

    // 6. GENDER (Handshake Truth v2.14.714)
    if (criteria.genderId != null) {
      result = result.filter(actor => (actor.gender_id || (actor as any).genderId) === criteria.genderId);
    }

    return this.sort(result, criteria.sortBy || 'popularity');
  }

  /**
   * Helper voor taal-variaties (bijv. 'nl-be' matcht met 'vlaams')
   */
  private static isLanguageVariationMatch(targetCode: string, actorLang?: string): boolean {
    if (!actorLang) return false;
    const al = actorLang.toLowerCase();
    
    // 🛡️ CHRIS-PROTOCOL: NATIVE-ONLY HARDENING (v2.14.106)
    // We hebben alle "behulpzame" gedeeltelijke matches verwijderd.
    // 'fr' mag NOOIT 'fr-be' matchen via een prefix-check.
    
    // Vlaams/Nederlands cross-matching
    if (targetCode === 'nl-be' && (al === 'vlaams' || al === 'nl-be' || al === 'nl')) return true;
    if (targetCode === 'nl-nl' && (al === 'nederlands' || al === 'nl-nl' || al === 'nl')) return true;
    
    // Frans variaties (Strikte matches)
    if (targetCode === 'fr-fr' && (al === 'frans' || al === 'fr-fr' || al === 'fr')) return true;
    if (targetCode === 'fr-be' && (al === 'frans (be)' || al === 'fr-be' || al === 'fr' || al === 'belgisch frans')) return true;
    
    // Engels variaties
    if (targetCode === 'en-gb' && (al === 'engels' || al === 'en-gb' || al === 'en')) return true;
    if (targetCode === 'en-us' && (al === 'engels (us)' || al === 'en-us' || al === 'en')) return true;

    // Duits variaties
    if (targetCode === 'de-de' && (al === 'duits' || al === 'de-de' || al === 'de')) return true;

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
          const preferredLanguageIds = Array.from(
            new Set(
              [
                market?.primary_language_id,
                ...((market?.popular_languages || [])
                  .map((code) => MarketManager.getLanguageId(code, market?.primary_language || 'nl-be'))
                  .filter((id): id is number => typeof id === 'number'))
              ].filter((id): id is number => typeof id === 'number')
            )
          );
          const preferredRank = new Map(preferredLanguageIds.map((id, index) => [id, index + 1]));
          
          const getLangScore = (actor: Actor) => {
            const actorAny = actor as any;
            const actorNativeId =
              actor.native_lang_id ||
              actorAny.native_language_id ||
              actorAny.nativeLanguageId;
            if (actorNativeId == null) return 999;
            const ranked = preferredRank.get(actorNativeId);
            if (ranked != null) return ranked;
            return 100 + (actorNativeId / 1000);
          };

          const langScoreA = getLangScore(a);
          const langScoreB = getLangScore(b);
          if (langScoreA !== langScoreB) return langScoreA - langScoreB;

          // 2. delivery_date_min_priority (Nuclear Speed Priority)
          // CHRIS-PROTOCOL: High priority actors (e.g. Christina) should appear first.
          const aAny = a as any;
          const bAny = b as any;
          const aSpeedPrio = aAny.delivery_date_min_priority || 0;
          const bSpeedPrio = bAny.delivery_date_min_priority || 0;
          if (aSpeedPrio !== bSpeedPrio) {
            return bSpeedPrio - aSpeedPrio;
          }

          // 3. delivery_date_min (Actual availability)
          if (aAny.delivery_date_min && bAny.delivery_date_min) {
            const aDate = new Date(aAny.delivery_date_min).getTime();
            const bDate = new Date(bAny.delivery_date_min).getTime();
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
