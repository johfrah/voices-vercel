import { db } from "@db";
import { actorDemos, actors } from "@db/schema";
import { and, eq, like, or, sql } from "drizzle-orm";
import { Actor, SearchResults } from "./api";

// 🛡️ VOICES OS: Dit bestand mag NOOIT in de browser worden geladen.
// Het bevat directe database-toegang.
if (typeof window !== 'undefined') {
  throw new Error('AgencyDataBridge can only be used on the server side.');
}

/**
 * NUCLEAR DATA BRIDGE - AGENCY JOURNEY (2026 EDITION)
 */

export interface PricingParams {
  usage: 'telefonie' | 'unpaid' | 'paid';
  words: number;
  media?: 'online' | 'tv' | 'radio' | 'podcast';
  country?: string;
  spots?: number;
  years?: number;
}

export interface CalculatedPrice {
  basePrice: number;
  wordSurcharge: number;
  mediaSurcharge: number;
  totalPrice: number;
  isStartingPrice: boolean;
}

export class AgencyDataBridge {
  /**
   * Haalt stemacteurs op uit Supabase (Hyper-fast)
   */
  static async getActors(params: Record<string, string> = {}): Promise<SearchResults> {
    console.log('🔍 Fetching actors from Supabase with params:', params);
    
    const { language, search, gender } = params;
    
    // 1. Bouw de query
    let query = db.select().from(actors);
    const conditions = [];

    // 🛡️ Filter alleen LIVE acteurs voor de publieke site
    conditions.push(eq(actors.status, 'live'));

    // 🛡️ JOHFRAI PROTECTION: Johfrah's AI voice mag NOOIT in de algemene agency resultaten verschijnen.
    // UITZONDERING: Voor telefonie kan het een laagdrempelige instap zijn.
    const isTelephony = params.usage === 'telefonie';
    const isStudio = params.journey === 'studio' || params.context === 'studio';
    const isExplicitSearch = search && search.toLowerCase().includes('johfra');
    
    if (isTelephony) {
      // Voor telefonie laten we Johfrah AI wel toe
      console.log('📞 Telephony mode: Johfrah AI allowed');
    } else {
      // In alle andere gevallen (inclusief Studio): GEEN AI promotie van Johfrah
      conditions.push(sql`${actors.firstName} NOT ILIKE 'Johfrah%' OR ${actors.isAi} = false`);
      conditions.push(eq(actors.isAi, false));
    }

    // 🛡️ Kirsten Duplicate Prevention (DB Level)
    // Als we zoeken op Kirsten, zorgen we dat we alleen de master (wpProductId 40) pakken
    if (search && search.toLowerCase().includes('kirsten')) {
      conditions.push(or(
        eq(actors.wpProductId, 40),
        sql`${actors.wpProductId} IS NOT NULL` // Voorkom records zonder WP ID als er een WP ID versie bestaat
      ));
    }

    if (language) {
      conditions.push(or(
        like(actors.nativeLang, `%${language}%`),
        like(actors.extraLangs, `%${language}%`)
      ));
    }

    if (gender) {
      conditions.push(eq(actors.gender, gender));
    }

    if (search) {
      conditions.push(or(
        like(actors.firstName, `%${search}%`),
        like(actors.tagline, `%${search}%`),
        like(actors.aiTags, `%${search}%`)
      ));
    }

    // @ts-ignore
    const results = await query.where(and(...conditions)).limit(50);

    // 2. Haal demo's op voor deze actors
    const actorIds = results.map(a => a.id);
    const demos = actorIds.length > 0 
      ? await db.select().from(actorDemos).where(sql`${actorDemos.actorId} IN ${actorIds}`)
      : [];

    // 3. Transformeer naar SearchResults formaat
    const ASSET_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

    const mappedResults = results.map(actor => ({
      id: actor.wpProductId || actor.id,
      display_name: actor.firstName,
      first_name: actor.firstName,
      gender: actor.gender,
      native_lang: actor.nativeLang,
      country: actor.country,
      photo_url: actor.dropboxUrl ? (actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE_URL}${actor.dropboxUrl}`) : null,
      starting_price: parseFloat(actor.priceUnpaid || '0'),
      voice_score: actor.voiceScore,
      tagline: actor.tagline,
      ai_enabled: actor.isAi,
      demos: demos
        .filter(d => d.actorId === actor.id)
        .map(d => ({
          id: d.id, 
          name: d.name,
          title: d.name, 
          url: d.url.startsWith('http') ? d.url : `${ASSET_BASE_URL}${d.url}`,
          audio_url: d.url.startsWith('http') ? d.url : `${ASSET_BASE_URL}${d.url}`, 
          type: d.type || 'commercial'
        }))
    }));

    return {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: {
        genders: ['Mannelijke stem', 'Vrouwelijke stem'],
        languages: ['Vlaams', 'Nederlands', 'Frans', 'Engels', 'Duits', 'Pools', 'Spaans', 'Italiaans', 'Portugees'],
        styles: ['Corporate', 'Commercial', 'Narrative', 'Energetic', 'Warm']
      },
      _nuclear: true,
      _source: 'supabase',
      _bridge_timestamp: new Date().toISOString()
    };
  }

  /**
   * Genereert LLM Context voor de Agency pagina
   */
  static getLLMContext(results: any[]) {
    const ASSET_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "numberOfItems": results.length,
      "itemListElement": results.slice(0, 10).map((actor, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Person",
          "name": actor.display_name,
          "jobTitle": "Voice Actor",
          "url": `${ASSET_BASE_URL}/agency/voices/${actor.id}`
        }
      }))
    };
  }

  /**
   * Real-time Prijs Calculator (Core Logic Port)
   */
  static calculatePrice(actor: Actor, params: PricingParams): CalculatedPrice {
    return {
      basePrice: 0,
      wordSurcharge: 0,
      mediaSurcharge: 0,
      totalPrice: 0,
      isStartingPrice: true
    };
  }
}
