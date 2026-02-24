import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";
import { MarketDatabaseService } from "@/lib/system/market-manager-db";
import { db } from "@db";
//  CHRIS-PROTOCOL: Source of Truth from Drizzle Schema
import { actors, actorDemos, actorVideos, contentArticles, contentBlocks, faq, lessons, media, products, reviews, translations } from "@db/schema";
import { createClient } from "@supabase/supabase-js";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
    Actor,
    SearchResults,
} from "../types";
import { VoiceglotBridge } from "../bridges/voiceglot-bridge";

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt (DNS/Pooler issues)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

/**
 *  SERVER-ONLY API (2026)
 * 
 * Bevat alle database-interacties die alleen op de server mogen draaien.
 * 
 * @lock-file
 */

export async function getArtist(slug: string, lang: string = 'nl'): Promise<any> {
  console.log(' API: Querying artist from the artists table:', slug);
  
  //  CHRIS-PROTOCOL: Youssef is een Artist, geen Actor.
  // We gebruiken geen hardcoded fallbacks meer. Alles moet via de database komen.
  const artist = await (db.query as any).artists.findFirst({
    where: (fields: any, { eq }: any) => eq(fields.slug, slug),
  }).catch(() => null);

  if (!artist) {
    console.warn(`[api-server] Artist not found for slug: ${slug}`);
    return null;
  }

  // Translate bio if needed
  const translatedBio = await VoiceglotBridge.t(artist.bio || '', lang);

  // Map to unified Artist object for UI
  return {
    ...artist,
    display_name: artist.displayName || artist.firstName,
    photo_url: artist.photoUrl,
    bio: translatedBio.replace(/<[^>]*>?/gm, '').trim(),
    donation_goal: artist.donationGoal || 0,
    donation_current: artist.donationCurrent || 0,
    spotify_url: artist.spotifyUrl || '',
    youtube_url: artist.youtube_url || '',
    instagram_url: artist.instagramUrl || '',
    tiktok_url: artist.tiktokUrl || '',
    demos: [] // Artist portfolio items could be mapped here if needed
  };
}

/**
 *  NUCLEAR CALCULATION: Real-time review statistics (SQL-First)
 */
export async function getReviewStats(businessSlug: string = 'voices-be') {
  const [stats] = await db.select({
    totalCount: sql<number>`count(*)`,
    averageRating: sql<number>`avg(${reviews.rating})`,
    star5: sql<number>`count(*) filter (where ${reviews.rating} = 5)`,
    star4: sql<number>`count(*) filter (where ${reviews.rating} = 4)`,
    star3: sql<number>`count(*) filter (where ${reviews.rating} = 3)`,
    star2: sql<number>`count(*) filter (where ${reviews.rating} = 2)`,
    star1: sql<number>`count(*) filter (where ${reviews.rating} = 1)`
  })
  .from(reviews)
  .where(eq(reviews.businessSlug, businessSlug));
  
  return {
    averageRating: stats?.averageRating ? Math.round(Number(stats.averageRating) * 10) / 10 : 4.9,
    totalCount: Number(stats?.totalCount || 0),
    distribution: {
      5: Number(stats?.star5 || 0),
      4: Number(stats?.star4 || 0),
      3: Number(stats?.star3 || 0),
      2: Number(stats?.star2 || 0),
      1: Number(stats?.star1 || 0)
    }
  };
}

//  CHRIS-PROTOCOL: In-memory cache for actors to reduce heavy DB load
function getGlobalCache() {
  if (typeof window !== 'undefined') return { actorsCache: {}, translationCache: {} };
  const g = global as any;
  if (!g.apiServerCache) {
    g.apiServerCache = { actorsCache: {}, translationCache: {} };
  }
  return g.apiServerCache;
}

const ACTORS_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl'): Promise<SearchResults> {
  const { language, search, gender, style, market: marketParam } = params;
  const market = marketParam || 'BE'; // Default to BE if not provided
  const cache = getGlobalCache();
  const cacheKey = JSON.stringify({ params, lang });
  const cached = cache.actorsCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < ACTORS_CACHE_TTL) return cached.data;

    try {
      // 🛡️ CHRIS-PROTOCOL: Use Supabase SDK for everything for stability on Vercel
      let dbResults: any[] = [];
      try {
        let query = supabase
          .from('actors')
          .select('*')
          .eq('status', 'live')
          .eq('is_public', true);
          
        if (language || lang) {
          const targetLang = (language || lang).toLowerCase();
          
          // 🛡️ CHRIS-PROTOCOL: Pre-selection logic (Make it easier, not impossible)
          // We filter on the server to provide a fast initial load, but the client 
          // can still request other languages or 'all'.
          if (targetLang === 'nl' || targetLang === 'nl-be' || targetLang === 'nl-nl') {
            query = query.or('native_lang.ilike.nl,native_lang.ilike.nl-%,native_lang.ilike.vlaams,native_lang.ilike.nederlands');
          } else if (targetLang === 'en' || targetLang === 'en-gb' || targetLang === 'en-us') {
            query = query.or('native_lang.ilike.en,native_lang.ilike.en-%,native_lang.ilike.engels');
          } else if (targetLang === 'fr-be' || targetLang === 'frans (be)') {
            // 🛡️ CHRIS-PROTOCOL: STRICT NATIVE-ONLY MATCHING
            // Als de bezoeker specifiek filtert op Frans (België), 
            // tonen we uitsluitend stemmen met de juiste regio-code.
            query = query.or('native_lang.ilike.fr-be,native_lang.ilike.frans (be),native_lang.ilike.belgisch frans');
          } else if (targetLang === 'fr-fr' || targetLang === 'frans (fr)') {
            query = query.or('native_lang.ilike.fr-fr,native_lang.ilike.frans (fr)');
          } else if (targetLang === 'fr') {
            // Algemene Franse filter (moedertaal)
            query = query.or('native_lang.ilike.fr,native_lang.ilike.fr-%');
          } else if (targetLang === 'de' || targetLang === 'de-de') {
            query = query.or('native_lang.ilike.de,native_lang.ilike.de-%,native_lang.ilike.duits');
          } else if (targetLang === 'all') {
            // 🛡️ CHRIS-PROTOCOL: 'all' allows the visitor to see the entire selection
            console.log(' [getActors] Fetching all live actors per request');
          } else {
            query = query.or(`native_lang.ilike.${targetLang},native_lang.ilike.${targetLang}-%`);
          }
        }
        
        if (gender) {
          query = query.eq('gender', gender);
        }
        
        const { data: sdkData, error: sdkError } = await query
          .order('menu_order', { ascending: true })
          .order('voice_score', { ascending: false })
          .limit(500);
          
        if (sdkError) {
          console.error(' [getActors] SDK Error:', sdkError);
          throw new Error(`SDK Error: ${sdkError.message}`);
        }
        
        dbResults = (sdkData || []).map(a => ({
          ...a,
          firstName: a.first_name,
          lastName: a.last_name,
          nativeLang: a.native_lang,
          countryId: a.country_id,
          wpProductId: a.wp_product_id,
          photoId: a.photo_id,
          voiceScore: a.voice_score,
          totalSales: a.total_sales,
          priceUnpaid: a.price_unpaid,
          priceOnline: a.price_online,
          priceIvr: a.price_ivr,
          priceLiveRegie: a.price_live_regie,
          dropboxUrl: a.dropbox_url,
          isAi: a.is_ai,
          elevenlabsId: a.elevenlabs_id,
          internalNotes: a.internal_notes,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          youtubeUrl: a.youtube_url,
          menuOrder: a.menu_order,
          deliveryDaysMin: a.delivery_days_min,
          deliveryDaysMax: a.delivery_days_max,
          cutoffTime: a.cutoff_time,
          samedayDelivery: a.sameday_delivery,
          pendingBio: a.pending_bio,
          pendingTagline: a.pending_tagline,
          experienceLevel: a.experience_level,
          studioSpecs: a.studio_specs,
          isManuallyEdited: a.is_manually_edited,
          birthYear: a.birth_year,
          aiTags: a.ai_tags,
          deliveryDateMin: a.delivery_date_min,
          deliveryDateMinPriority: a.delivery_date_min_priority
        }));
      } catch (dbError) {
        console.error(' [getActors] SDK Query failed:', dbError);
        if (cached) return cached.data;
        throw dbError;
      }

    const photoIds = Array.from(new Set(dbResults.map(a => a.photoId).filter(Boolean).map(id => Number(id))));
    const actorIds = dbResults.map(a => a.id);
    
    // Fetch secondary data via SDK for stability
    const reviewsRes = await supabase
      .from('reviews')
      .select('*')
      .eq('business_slug', market === 'STUDIO' || market === 'ACADEMY' ? 'voices-studio' : 'voices-be')
      .eq('status', 'published')
      .limit(20);
    const mediaRes = photoIds.length > 0 ? await supabase.from('media').select('*').in('id', photoIds) : { data: [] };
    const demosRes = await supabase.from('actor_demos').select('*').in('actor_id', actorIds).eq('is_public', true);
    const videosRes = await supabase.from('actor_videos').select('*').in('actor_id', actorIds).eq('is_public', true);
    
    // 🛡️ CHRIS-PROTOCOL: Fetch actor_languages relationships (v2.14.107)
    // We NEED the IDs to match strictly in the frontend.
    const actorLangsRes = await supabase.from('actor_languages').select('*').in('actor_id', actorIds);
    const actorLangsData = actorLangsRes.data || [];

    // Create lookup maps for performance
    const nativeLangMap = new Map<number, number>();
    const extraLangsMap = new Map<number, number[]>();

    actorLangsData.forEach((al: any) => {
      // 🛡️ CHRIS-PROTOCOL: Map snake_case (Supabase SDK) to camelCase (Drizzle Standard)
      const languageId = al.language_id || al.languageId;
      const actorId = al.actor_id || al.actorId;
      const isNative = al.is_native === true || al.isNative === true;

      if (isNative) {
        nativeLangMap.set(actorId, languageId);
      } else {
        const current = extraLangsMap.get(actorId) || [];
        extraLangsMap.set(actorId, [...current, languageId]);
      }
    });
    
    //  CHRIS-PROTOCOL: Fetch review stats for the correct business unit
    const statsRes = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_slug', market === 'STUDIO' || market === 'ACADEMY' ? 'voices-studio' : 'voices-be')
      .eq('status', 'published');
    
    const dbReviewsRaw = reviewsRes.data || [];
    const mediaResults = mediaRes.data || [];
    const demosData = demosRes.data || [];
    const videosData = videosRes.data || [];
    const statsRaw = statsRes.data || [];
    
    // Calculate stats manually for stability
    const totalCount = statsRaw.length;
    const avgRating = totalCount > 0 
      ? Math.round((statsRaw.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / totalCount) * 10) / 10 
      : 4.9;
    
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    statsRaw.forEach((r: any) => {
      if (r.rating) distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    
    const mappedResults = dbResults.map((actor) => {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
      const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;
      
      let photoUrl = '';
      
      //  CHRIS-PROTOCOL: Priority for manually uploaded photo (dropboxUrl)
      if (actor.dropboxUrl) {
        photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `/api/proxy/?path=${encodeURIComponent(actor.dropboxUrl)}`;
      } else if (actor.photoId) {
        const mediaItem = mediaResults.find((m: any) => m.id === actor.photoId);
        if (mediaItem) {
          const fp = mediaItem.file_path || mediaItem.filePath;
          if (fp) photoUrl = fp.startsWith('http') ? fp : `${SUPABASE_STORAGE_URL}/${fp}`;
        }
      }

      const actorDemosList = demosData.filter((d: any) => d.actor_id === actor.id);
      const proxiedDemos = actorDemosList.map((d: any) => ({
        id: d.id,
        title: d.name,
        audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
        category: d.type || 'demo',
        status: d.status || 'approved'
      }));

      const actorVideosList = videosData.filter((v: any) => v.actor_id === actor.id);
      const proxiedVideos = actorVideosList.map((v: any) => ({
        id: v.id,
        name: v.name,
        url: v.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(v.url)}` : v.url,
        type: v.type || 'portfolio'
      }));

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        last_name: actor.lastName || '',
        slug: actor.slug || actor.firstName?.toLowerCase(),
        gender: actor.gender,
        native_lang: actor.nativeLang,
        photo_url: photoUrl,
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        voice_score: actor.voiceScore || 10,
        total_sales: actor.totalSales || 0,
        menu_order: actor.menuOrder || 0,
        ai_enabled: actor.isAi,
        bio: (actor.bio || '').replace(/<[^>]*>?/gm, '').trim(),
        tagline: (actor.tagline || '').replace(/<[^>]*>?/gm, '').trim(),
        delivery_days_min: actor.deliveryDaysMin || 1,
        delivery_days_max: actor.deliveryDaysMax || 3,
        native_lang_id: nativeLangMap.get(actor.id) || null,
        extra_lang_ids: extraLangsMap.get(actor.id) || [],
        demos: proxiedDemos,
        actor_videos: proxiedVideos,
        rates: actor.rates || {}
      };
    });

    const result: SearchResults = {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: { genders: ['Mannelijk', 'Vrouwelijk'], languages: [], styles: [] },
      reviews: dbReviewsRaw.map((r: any) => ({
        id: r.id,
        name: r.author_name || r.authorName,
        text: r.text_nl || r.text_en || '',
        rating: r.rating,
        provider: r.provider,
        authorPhotoUrl: r.author_photo_url || r.authorPhotoUrl,
        date: new Date(r.created_at || r.createdAt || Date.now()).toLocaleDateString('nl-BE')
      })),
      reviewStats: { 
        averageRating: avgRating, 
        totalCount: totalCount, 
        distribution: distribution 
      },
      _v: 'v2.14.56 (Godmode Zero)'
    };

    cache.actorsCache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error: any) {
    console.error('[getActors FATAL ERROR]:', error);
    throw error;
  }
}

export async function getArticle(slug: string, lang: string = 'nl'): Promise<any> {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data: article, error } = await supabase
    .from('content_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !article) {
    console.warn(`[api-server] Article not found for slug: ${slug}`, error);
    return null;
  }

  const translatedTitle = await VoiceglotBridge.t(`page.${slug}.title`, lang, true);
  
  // Fetch blocks via SDK
  const { data: blocks } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('article_id', article.id)
    .order('display_order', { ascending: true });

  return { 
    ...article, 
    id: article.id,
    title: translatedTitle, 
    blocks: blocks || [] 
  };
}

export async function getActor(slug: string, lang: string = 'nl'): Promise<Actor> {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for consistency and field prioritization
  const { data: actor, error } = await supabase
    .from('actors')
    .select('*, country:countries(*)')
    .eq('slug', slug)
    .single();

  if (error || !actor) {
    console.error(`[getActor] Error or not found: ${slug}`, error);
    throw new Error("Actor not found");
  }

  // Fetch relations
  const [demosRes, videosRes] = await Promise.all([
    supabase.from('actor_demos').select('*').eq('actor_id', actor.id).eq('is_public', true),
    supabase.from('actor_videos').select('*').eq('actor_id', actor.id).eq('is_public', true)
  ]);

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
  const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;

  // Prioritize dropboxUrl for photo
  let photoUrl = '';
  if (actor.dropbox_url) {
    photoUrl = actor.dropbox_url.startsWith('http') ? actor.dropbox_url : `/api/proxy/?path=${encodeURIComponent(actor.dropbox_url)}`;
  } else if (actor.photo_id) {
    // 🛡️ CHRIS-PROTOCOL: Nuclear Asset Healing (v2.14.199)
    // We fetch the media item and verify its existence.
    const { data: mediaItem } = await supabase.from('media').select('*').eq('id', actor.photo_id).single();
    if (mediaItem) {
      const fp = mediaItem.file_path || mediaItem.filePath;
      if (fp) {
        photoUrl = fp.startsWith('http') ? fp : `${SUPABASE_STORAGE_URL}/${fp}`;
        
        // 🛡️ FORENSIC CHECK: Is this a known broken asset path?
        if (fp.includes('goedele-A-234829') || fp.includes('charline-A-186167') || fp.includes('sander-A-234808')) {
          console.warn(` [Asset Guard] Detected potentially broken legacy path: ${fp}`);
          // Trigger silent healing report
          const { ServerWatchdog } = await import('@/lib/services/server-watchdog');
          await ServerWatchdog.report({
            error: `Broken asset path detected in getActor: ${fp}`,
            component: 'AssetGuard',
            url: `/actor/${slug}`,
            level: 'warning',
            details: { actorId: actor.id, filePath: fp }
          });
        }
      }
    }
  }

  const mappedDemos = (demosRes.data || []).map((d: any) => ({
    id: d.id,
    title: d.name,
    audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
    category: d.type || 'demo',
    status: d.status || 'approved'
  }));

  const mappedVideos = (videosRes.data || []).map((v: any) => ({
    id: v.id,
    name: v.name,
    url: v.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(v.url)}` : v.url,
    type: v.type || 'portfolio'
  }));

  return {
    ...actor,
    id: actor.wp_product_id || actor.id,
    display_name: actor.first_name,
    first_name: actor.first_name,
    last_name: actor.last_name || '',
    native_lang: actor.native_lang,
    photo_url: photoUrl,
    starting_price: parseFloat(actor.price_unpaid || '0'),
    voice_score: actor.voice_score || 10,
    demos: mappedDemos,
    actor_videos: mappedVideos,
    rates: actor.rates || {}
  } as any;
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  const musicMedia = await db.select().from(media).where(eq(media.category, category)).limit(50).catch(async (e) => {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch music library for category: ${category}`,
      stack: e instanceof Error ? e.stack : String(e),
      component: 'api-server:getMusicLibrary',
      level: 'error'
    });
    return [];
  });
  return (musicMedia || []).map(m => ({ id: m.id.toString(), title: m.fileName, preview: m.filePath }));
}

export async function getAcademyLesson(id: string): Promise<any> {
  const results = await db.select().from(lessons).where(eq(lessons.displayOrder, parseInt(id))).limit(1).catch(async (e) => {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch academy lesson for id: ${id}`,
      stack: e instanceof Error ? e.stack : String(e),
      component: 'api-server:getAcademyLesson',
      level: 'error'
    });
    return [];
  });
  return results[0] || null;
}

export async function getFaqs(category: string, limit: number = 5): Promise<any[]> {
  const data = await db.select().from(faq).where(and(eq(faq.category, category), eq(faq.isPublic, true))).limit(limit).catch(async (e) => {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch faqs for category: ${category}`,
      stack: e instanceof Error ? e.stack : String(e),
      component: 'api-server:getFaqs',
      level: 'error'
    });
    return [];
  });
  return data || [];
}

export async function getWorkshops(limit: number = 50): Promise<any[]> {
  const workshopsData = await (db.query as any).workshops?.findMany({ limit }).catch(async (e: any) => {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch workshops`,
      stack: e instanceof Error ? e.stack : String(e),
      component: 'api-server:getWorkshops',
      level: 'error'
    });
    return [];
  });
  return workshopsData || [];
}

export async function getTranslationsServer(lang: string): Promise<Record<string, string>> {
  if (lang === 'nl') return {};
  const cache = getGlobalCache();
  const cached = cache.translationCache[lang];
  if (cached && (Date.now() - cached.timestamp) < 3600000) return cached.data;
  
  try {
    // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
    const { data, error } = await supabase
      .from('translations')
      .select('translation_key, translated_text, original_text')
      .eq('lang', lang)
      .limit(500);

    if (error) throw error;

    const translationMap: Record<string, string> = {};
    data?.forEach((row: any) => { 
      const key = row.translation_key || row.translationKey;
      if (key) {
        translationMap[key] = row.translated_text || row.translatedText || row.original_text || row.originalText || ''; 
      }
    });
    
    cache.translationCache[lang] = { data: translationMap, timestamp: Date.now() };
    return translationMap;
  } catch (e) { 
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch translations for lang: ${lang}`,
      stack: e instanceof Error ? e.stack : String(e),
      component: 'api-server:getTranslationsServer',
      level: 'error'
    });
    return {}; 
  }
}

export async function getProducts(category?: string): Promise<any[]> {
  return await (db.query as any).products?.findMany({ limit: 10 }).catch(async (e: any) => {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch products`,
      stack: e instanceof Error ? e.stack : String(e),
      component: 'api-server:getProducts',
      level: 'error'
    });
    return [];
  });
}
