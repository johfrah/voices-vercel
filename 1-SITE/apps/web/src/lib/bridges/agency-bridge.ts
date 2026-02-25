import { db } from '@/lib/system/db';
import { actorDemos, actors } from '@/lib/system/db';
import { and, eq, like, or, sql } from "drizzle-orm";
import { Actor, SearchResults } from "../services/api";

//  VOICES OS: Dit bestand mag NOOIT in de browser worden geladen.
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
    console.log(' Fetching actors from Supabase with params:', params);
    
    const { language, search, gender } = params;
    
    // 1. Bouw de query
    let query = db.select().from(actors);
    const conditions = [];

    //  Filter alleen LIVE acteurs voor de publieke site
    conditions.push(eq(actors.status, 'live'));

    //  JOHFRAI PROTECTION: Johfrah's AI voice mag NOOIT in de algemene agency resultaten verschijnen.
    // UITZONDERING: Voor telefonie kan het een laagdrempelige instap zijn.
    const isTelephony = params.usage === 'telefonie';
    const isStudio = params.journey === 'studio' || params.context === 'studio';
    const isExplicitSearch = search && (search.toLowerCase().includes('johfra') || search.toLowerCase().includes('johfrah'));
    
    if (isTelephony || isExplicitSearch) {
      // Voor telefonie of expliciete zoekopdracht laten we Johfrah AI wel toe
      console.log(' Johfrah AI allowed (Telephony or Explicit Search)');
    } else {
      // In alle andere gevallen (inclusief Studio): GEEN AI promotie van Johfrah
      conditions.push(sql`${actors.firstName} NOT ILIKE 'Johfrah%' OR ${actors.isAi} = false`);
      conditions.push(eq(actors.isAi, false));
    }

    //  Kirsten Duplicate Prevention (DB Level)
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

    // 2. Haal demo's en media op voor deze actors
    const actorIds = results.map(a => a.id);
    const photoIds = results.map(a => a.photoId).filter(Boolean);
    
    const [demos, mediaResults] = await Promise.all([
      actorIds.length > 0 
        ? db.select().from(actorDemos).where(sql`${actorDemos.actorId} IN ${actorIds}`)
        : Promise.resolve([]),
      photoIds.length > 0
        ? db.select().from(media).where(sql`${media.id} IN ${photoIds}`)
        : Promise.resolve([])
    ]);

    // 3. Transformeer naar SearchResults formaat
    const ASSET_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

    const mappedResults = results.map(actor => {
      //  CHRIS-PROTOCOL: Relationele koppeling is heilig.
      // We gebruiken de directe koppeling uit de database (actorDemos).
      const actorDemosList = demos
        .filter(d => d.actorId === actor.id)
        .map(d => ({
          id: d.id, 
          name: d.name,
          title: d.name, 
          audio_url: d.url.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url, 
          type: d.type || 'commercial'
        }));

      //  LOUIS: photoId (Supabase Storage) prioritized over dropboxUrl/legacy URLs.
      //  2026 UPDATE: Check first for local optimized photos in visuals/active/voicecards/
      let photoUrl: string | null = null;
      
      // Try to find a local optimized version first based on actor ID
      const actorId = actor.wpProductId || actor.id;
      
      //  MOBY MANDATE: Use the new voicecards directory with strict naming convention
      const localVoicecardPath = `/assets/visuals/active/voicecards/${actorId}-${actor.firstName?.toLowerCase()}-photo-square-1.jpg`;
      
      // Default fallback chain
      photoUrl = localVoicecardPath; 

      if (actor.photoId) {
        const mediaItem = mediaResults.find(m => m.id === actor.photoId);
        if (mediaItem) {
          const resolvedPath = mediaItem.filePath.startsWith('http') ? mediaItem.filePath : `${ASSET_BASE_URL.replace(/\/$/, '')}/${mediaItem.filePath.replace(/^\//, '')}`;
          // If we have a photoId, it's a strong manual link, but we still prefer the localVoicecardPath if it exists (checked on frontend)
          if (!photoUrl) photoUrl = resolvedPath;
        }
      }
      if ((!photoUrl || photoUrl === localVoicecardPath) && actor.dropboxUrl) {
        photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE_URL}${actor.dropboxUrl}`;
      }

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        gender: actor.gender,
        native_lang: actor.nativeLang,
        country: actor.country,
        photo_url: photoUrl,
        local_photo_path: localVoicecardPath, // Pass the path for fallback logic
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        voice_score: actor.voiceScore,
        tagline: actor.tagline,
        ai_enabled: actor.isAi,
        demos: actorDemosList
      };
    });

    return {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: {
        genders: ['Mannelijk', 'Vrouwelijk'],
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
