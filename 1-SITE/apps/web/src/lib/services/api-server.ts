import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";
import { MarketDatabaseService } from "@/lib/system/market-manager-db";
import { createClient } from "@supabase/supabase-js";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
    Actor,
    SearchResults,
} from "../../types";
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
  
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data: artist, error } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !artist) {
    console.warn(`[api-server] Artist not found for slug: ${slug}`, error);
    return null;
  }

  // Translate bio if needed
  const translatedBio = await VoiceglotBridge.t(artist.bio || '', lang);

  // Map to unified Artist object for UI
  // 🛡️ CHRIS-PROTOCOL: Fetch portfolio items (demos/videos) for Artist (v2.15.043)
  const { data: demos } = await supabase
    .from('actor_portfolio')
    .select('*')
    .eq('actor_id', artist.id)
    .eq('is_public', true);

  return {
    ...artist,
    display_name: artist.display_name || artist.first_name || artist.displayName || artist.first_name,
    photo_url: artist.photo_url || artist.photoUrl,
    bio: translatedBio.replace(/<[^>]*>?/gm, '').trim(),
    donation_goal: artist.donation_goal || artist.donationGoal || 0,
    donation_current: artist.donation_current || artist.donationCurrent || 0,
    spotify_url: artist.spotify_url || artist.spotifyUrl || '',
    youtube_url: artist.youtube_url || '',
    instagram_url: artist.instagram_url || artist.instagramUrl || '',
    tiktok_url: artist.tiktok_url || artist.tiktokUrl || '',
    demos: (demos || []).map(d => ({
      id: d.id,
      title: d.name,
      url: d.url,
      category: d.type || 'performance'
    })),
    albums: artist.iapContext?.albums || [] // Fallback to context if not in separate table
  };
}

/**
 *  NUCLEAR CALCULATION: Real-time review statistics (SQL-First)
 */
export async function getReviewStats(businessSlug: string = 'voices-be', journeyId?: string) {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  let query = supabase
    .from('reviews')
    .select('rating');
  
  if (journeyId) {
    query = query.eq('journey_id', journeyId);
  } else {
    query = query.eq('business_slug', businessSlug);
  }

  const { data: stats, error } = await query;

  if (error || !stats) {
    return {
      averageRating: 4.9,
      totalCount: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const totalCount = stats.length;
  const avgRating = totalCount > 0 
    ? Math.round((stats.reduce((acc, r) => acc + (r.rating || 5), 0) / totalCount) * 10) / 10 
    : 4.9;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stats.forEach(r => {
    if (r.rating) distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });
  
  return {
    averageRating: avgRating,
    totalCount,
    distribution
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
  const { language, country, attribute, search, gender, style, market: marketParam } = params;
  const market = marketParam || 'BE'; // Default to BE if not provided
  const cache = getGlobalCache();
  const cacheKey = JSON.stringify({ params, lang });
  const cached = cache.actorsCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < ACTORS_CACHE_TTL) return cached.data;

    try {
      // 🛡️ CHRIS-PROTOCOL: Use Supabase SDK for everything for stability on Vercel
      let dbResults: any[] = [];
      try {
        // 🛡️ CHRIS-PROTOCOL: Handshake Truth (v2.15.042)
        // We fetch the 'live' status ID to ensure strict relational filtering.
        const { data: liveStatus } = await supabase.from('actor_statuses').select('id').eq('code', 'live').single();
        const liveStatusId = liveStatus?.id || 1; // Fallback to 1 (Live) if not found
        
        let query = supabase
          .from('actors')
          .select('*')
          .eq('status_id', liveStatusId)
          .eq('is_public', true);
          
        // 🛡️ NUCLEAR HANDSHAKE: ID-First Filtering (v2.14.740)
        // We use the database as the source of truth for IDs.
        // If a specific languageId is provided, we use it.
        // If only a string 'language' or 'lang' is provided, we resolve it to IDs.
        const targetLangInput = params.languageId || language || lang;

        if (targetLangInput && targetLangInput !== 'all' && targetLangInput !== 'any') {
          if (!isNaN(parseInt(targetLangInput))) {
            query = query.eq('native_language_id', parseInt(targetLangInput));
          } else {
            // Resolve string to ID(s)
            const lowLang = targetLangInput.toLowerCase();
            const { data: allLangs } = await supabase.from('languages').select('id, code, label');
            
            if (allLangs) {
              // Special case: 'nl' should match both Vlaams (1) and Nederlands (2)
              if (lowLang === 'nl') {
                query = query.in('native_language_id', [1, 2]);
              } else if (lowLang === 'fr') {
                query = query.in('native_language_id', [3, 4]);
              } else if (lowLang === 'en') {
                query = query.in('native_language_id', [5, 6]);
              } else {
                const match = allLangs.find(l => 
                  l.code.toLowerCase() === lowLang || 
                  l.label.toLowerCase() === lowLang
                );
                if (match) {
                  query = query.eq('native_language_id', match.id);
                } else {
                  // Last resort fallback to legacy column if ID not found
                  // query = query.eq('native_lang', lowLang);
                }
              }
            }
          }
        }

        if (gender) {
          if (!isNaN(parseInt(gender))) {
            query = query.eq('gender_id', parseInt(gender));
          } else {
            // Fallback for string-based gender filtering
            const { data: allGenders } = await supabase.from('genders').select('id, code');
            if (allGenders) {
              const match = allGenders.find(g => g.code.toLowerCase() === gender.toLowerCase());
              if (match) {
                query = query.eq('gender_id', match.id);
              } else {
                // query = query.eq('gender', gender);
              }
            }
          }
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
          first_name: a.first_name,
          last_name: a.last_name,
          native_lang_id: a.native_language_id,
          countryId: a.country_id,
          wp_product_id: a.wp_product_id,
          photo_id: a.photo_id,
          voice_score: a.voice_score,
          totalSales: a.total_sales,
          price_unpaid: a.price_unpaid,
          price_online: a.price_online,
          price_ivr: a.price_ivr,
          price_live_regie: a.price_live_regie,
          dropbox_url: a.dropbox_url,
          is_ai: a.is_ai,
          elevenlabs_id: a.elevenlabs_id,
          internal_notes: a.internal_notes,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          youtubeUrl: a.youtube_url,
          menu_order: a.menu_order,
          delivery_days_min: a.delivery_days_min,
          delivery_days_max: a.delivery_days_max,
          cutoff_time: a.cutoff_time,
          sameday_delivery: a.sameday_delivery,
          pending_bio: a.pending_bio,
          pending_tagline: a.pending_tagline,
          experience_level: a.experience_level,
          studio_specs: a.studio_specs,
          is_manually_edited: a.is_manually_edited,
          birth_year: a.birth_year,
          ai_tags: a.ai_tags,
          delivery_date_min: a.delivery_date_min,
          delivery_date_min_priority: a.delivery_date_min_priority
        }));
      } catch (dbError) {
        console.error(' [getActors] SDK Query failed:', dbError);
        if (cached) return cached.data;
        throw dbError;
      }

    const photoIds = Array.from(new Set(dbResults.map(a => a.photo_id).filter(Boolean).map(id => Number(id))));
    const actorIds = dbResults.map(a => a.id);
    
    // 🛡️ CHRIS-PROTOCOL: Use secondary data via SDK for stability
    const reviewsRes = await supabase
      .from('reviews')
      .select('*')
      .eq('business_slug', market === 'STUDIO' || market === 'ACADEMY' ? 'voices-studio' : 'voices-be')
      .limit(20);
    const mediaRes = photoIds.length > 0 ? await supabase.from('media').select('*').in('id', photoIds) : { data: [] };
    const demosRes = await supabase.from('actor_demos').select('*').in('actor_id', actorIds).eq('is_public', true);
    const videosRes = await supabase.from('actor_videos').select('*').in('actor_id', actorIds).eq('is_public', true);
    
    // 🛡️ CHRIS-PROTOCOL: Fetch actor_languages relationships (v2.14.107)
    // We NEED the IDs to match strictly in the frontend.
    const actorLangsRes = await supabase.from('actor_languages').select('*').in('actor_id', actorIds);
    const actorLangsData = actorLangsRes.data || [];

    // 🛡️ CHRIS-PROTOCOL: Global Data Registry for Handshake Truth (v2.14.716)
    // We fetch all relational data to ensure labels are available for mapping.
    const { data: allLangsData } = await supabase.from('languages').select('*');
    const { data: allStatusesData } = await supabase.from('actor_statuses').select('*');
    const { data: allExperienceData } = await supabase.from('experience_levels').select('*');
    const { data: allCountriesData } = await supabase.from('countries').select('*');
    const { data: allGendersData } = await supabase.from('genders').select('*');
    const { data: allMediaTypesData } = await supabase.from('media_types').select('*');

    const langLookup = new Map<number, { code: string, label: string }>();
    allLangsData?.forEach(l => langLookup.set(l.id, { code: l.code, label: l.label }));

    // 🛡️ CHRIS-PROTOCOL: Handshake Truth (v2.14.716)
    // We prime the global cache for other server functions.
    const g = global as any;
    if (allLangsData) g.handshakeLanguages = allLangsData;
    if (allStatusesData) g.handshakeStatuses = allStatusesData;
    if (allExperienceData) g.handshakeExperience = allExperienceData;
    if (allCountriesData) g.handshakeCountries = allCountriesData;
    if (allGendersData) g.handshakeGenders = allGendersData;
    if (allMediaTypesData) g.handshakeMediaTypes = allMediaTypesData;

    // Create lookup maps for performance
    const nativeLangMap = new Map<number, number>();
    const extraLangsMap = new Map<number, number[]>();
    const extraLangsStringMap = new Map<number, string>();

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
        
        // Update the legacy string representation for components like TelephonySmartSuggestions
        const langInfo = langLookup.get(languageId);
        if (langInfo) {
          const currentStr = extraLangsStringMap.get(actorId);
          extraLangsStringMap.set(actorId, currentStr ? `${currentStr}, ${langInfo.code}` : langInfo.code);
        }
      }
    });
    
    //  CHRIS-PROTOCOL: Fetch review stats for the correct business unit
    const statsRes = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_slug', market === 'STUDIO' || market === 'ACADEMY' ? 'voices-studio' : 'voices-be');
    
    const dbReviewsRaw = reviewsRes.data || [];
    const mediaResults = mediaRes.data || [];
    const demosData = demosRes.data || [];
    const videosData = videosRes.data || [];
    const statsRaw = statsRes.data || [];

    // 🛡️ CHRIS-PROTOCOL: Nuclear Review Media Resolution (v2.14.547)
    // We fetch ALL media for reviews to ensure 1 Truth Handshake
    const reviewMediaPaths = dbReviewsRaw.map((r: any) => r.author_photo_url).filter((p: string) => p && p.startsWith('reviews/'));
    const { data: reviewMediaResults } = reviewMediaPaths.length > 0 
      ? await supabase.from('media').select('id, file_path').in('file_path', reviewMediaPaths)
      : { data: [] };
    
    // 🛡️ CHRIS-PROTOCOL: Fetch Top Reviews for Actors (Zero-Latency Batching)
    // We fetch one top review per actor in the current result set
    const { data: actorTopReviewsRaw } = await supabase
      .from('actor_reviews')
      .select(`
        actor_id,
        review:reviews (
          id,
          rating,
          text_nl,
          text_en,
          author_name,
          created_at
        )
      `)
      .in('actor_id', actorIds);

    const actorTopReviewsMap = new Map();
    actorTopReviewsRaw?.forEach((ar: any) => {
      if (!actorTopReviewsMap.has(ar.actor_id)) {
        actorTopReviewsMap.set(ar.actor_id, ar.review);
      }
    });

    // 🛡️ CHRIS-PROTOCOL: Fetch Journey-specific Service Reviews (Fallback)
    const journeyId = market === 'STUDIO' ? '1' : (market === 'ACADEMY' ? '30' : (params.journey === 'telephony' ? '3' : null));
    let serviceReviews: any[] = [];
    if (journeyId) {
      const { data: serviceData } = await supabase
        .from('reviews')
        .select('*')
        .eq('journey_id', journeyId)
        .limit(10);
      serviceReviews = serviceData || [];
    }

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
      if (actor.dropbox_url) {
        photoUrl = actor.dropbox_url.startsWith('http') ? actor.dropbox_url : `/api/proxy/?path=${encodeURIComponent(actor.dropbox_url)}`;
      } else if (actor.photo_id) {
        const mediaItem = mediaResults.find((m: any) => m.id === actor.photo_id);
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

      const nativeLangId = nativeLangMap.get(actor.id) || actor.native_language_id || null;
      const nativeLangInfo = nativeLangId ? langLookup.get(nativeLangId) : null;
      
      // 🛡️ CHRIS-PROTOCOL: Handshake Truth Resolution (v2.14.676)
      const statusInfo = allStatusesData?.find(s => s.id === actor.status_id);
      const experienceInfo = allExperienceData?.find(e => e.id === actor.experience_level_id);
      const countryInfo = allCountriesData?.find(c => c.id === actor.country_id);

      // 🛡️ CHRIS-PROTOCOL: Assign Top Review (Actor-specific or Service-Mirror)
      const actorReview = actorTopReviewsMap.get(actor.id);
      let topReviewData = null;

      if (actorReview) {
        topReviewData = {
          text: actorReview.text_nl || actorReview.text_en || '',
          rating: actorReview.rating,
          author: actorReview.author_name,
          type: 'actor'
        };
      } else if (serviceReviews.length > 0) {
        // Pick a stable service review based on actor ID to avoid flickering
        const serviceReview = serviceReviews[actor.id % serviceReviews.length];
        topReviewData = {
          text: serviceReview.text_nl || serviceReview.text_en || '',
          rating: serviceReview.rating,
          author: serviceReview.author_name,
          type: 'service'
        };
      }

      return {
        id: actor.wp_product_id || actor.id,
        display_name: actor.first_name,
        first_name: actor.first_name,
        last_name: actor.last_name || '',
        slug: actor.slug || actor.first_name?.toLowerCase(),
        gender: actor.gender,
        native_lang_id: nativeLangId,
        native_lang: nativeLangInfo?.code || '',
        native_lang_label: nativeLangInfo?.label || '',
        photo_url: photoUrl,
        starting_price: parseFloat(actor.price_unpaid || '0'),
        voice_score: actor.voice_score || 10,
        total_sales: actor.totalSales || 0,
        menu_order: actor.menu_order || 0,
        ai_enabled: actor.is_ai,
        bio: (actor.bio || '').replace(/<[^>]*>?/gm, '').trim(),
        tagline: (actor.tagline || '').replace(/<[^>]*>?/gm, '').trim(),
        delivery_days_min: actor.delivery_days_min || 1,
        delivery_days_max: actor.delivery_days_max || 3,
        extra_lang_ids: extraLangsMap.get(actor.id) || [],
        extra_langs: extraLangsStringMap.get(actor.id) || '',
        demos: proxiedDemos,
        actor_videos: proxiedVideos,
        rates: actor.rates || {},
        email: actor.email || '',
        status: statusInfo?.label || 'live',
        status_code: statusInfo?.code || 'live',
        experience_level: experienceInfo?.label || 'pro',
        experience_level_code: experienceInfo?.code || 'pro',
        country: countryInfo?.label || 'België',
        country_code: countryInfo?.code || 'BE',
        clients: actor.clients || '',
        tone_of_voice: actor.tone_of_voice || '',
        cutoff_time: actor.cutoff_time || '18:00',
        portfolio_tier: actor.portfolio_tier || 'none',
        top_review: topReviewData
      };
    });

    const result: SearchResults = {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: { genders: ['Mannelijk', 'Vrouwelijk'], languages: [], styles: [] },
      _handshake_languages: allLangsData || [], // 🛡️ CHRIS-PROTOCOL: Pass languages for UI mapping
      reviews: dbReviewsRaw.map((r: any) => {
        const mediaItem = reviewMediaResults?.find((m: any) => m.file_path === r.author_photo_url);
        return {
          id: r.id,
          name: r.author_name || r.authorName,
          text: r.text_nl || r.text_en || '',
          rating: r.rating,
          provider: r.provider,
          authorPhotoUrl: r.author_photo_url || r.authorPhotoUrl,
          mediaId: mediaItem?.id || null, // 🛡️ CHRIS-PROTOCOL: 1 Truth Handshake
          date: new Date(r.created_at || r.createdAt || Date.now()).toLocaleDateString('nl-BE')
        };
      }),
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
  const cleanSlug = slug?.trim().toLowerCase();
  const isNumericId = /^\d+$/.test(cleanSlug);
  
  console.error(` [api-server] getActor lookup START: "${cleanSlug}" (isId: ${isNumericId}, lang: ${lang})`);
  
  if (!cleanSlug) throw new Error("Slug is required");

  // 🛡️ CHRIS-PROTOCOL: Nuclear Direct Match for Johfrah (v2.14.546)
  const isJohfrah = cleanSlug === 'johfrah' || cleanSlug === 'johfrah-lefebvre';

  try {
    // 1. Primary lookup - DRIZZLE FIRST (Atomic Pulse)
    const { db: directDb, actors: actorsTable } = await import('@/lib/system/voices-config');
    
    if (directDb) {
      let results;
      if (isNumericId) {
        console.error(` [api-server] Executing Drizzle query for ID: ${cleanSlug}`);
        results = await directDb.select().from(actorsTable).where(eq(actorsTable.id, parseInt(cleanSlug))).limit(1);
      } else {
        console.error(` [api-server] Executing Drizzle query for slug: ${cleanSlug}`);
        results = await directDb.select().from(actorsTable).where(eq(actorsTable.slug, cleanSlug)).limit(1);
      }
      
      const actor = results[0];

      if (actor) {
        console.error(` [api-server] SUCCESS: Found actor ${actor.first_name} by ${isNumericId ? 'ID' : 'slug'} (Drizzle).`);
        return processActorData(actor, cleanSlug);
      }

      // 2. Fallback by first_name (Only if not numeric)
      if (!isNumericId) {
        console.warn(` [api-server] Slug match failed, trying first_name fallback (Drizzle)...`);
        const fallbackResults = await directDb.select().from(actorsTable).where(ilike(actorsTable.first_name, cleanSlug)).limit(1);
        const fallbackActor = fallbackResults[0];
        
        if (fallbackActor) {
          console.error(` [api-server] SUCCESS: Found actor ${fallbackActor.first_name} by first_name (Drizzle).`);
          return processActorData(fallbackActor, cleanSlug);
        }
      }

      // 3. Last resort: Johfrah ID match
      if (isJohfrah) {
        console.error(` [api-server] NUCLEAR FALLBACK: Fetching Johfrah by ID 1760 (Drizzle)`);
        const finalResults = await directDb.select().from(actorsTable).where(eq(actorsTable.id, 1760)).limit(1);
        const finalActor = finalResults[0];
        
        if (finalActor) {
          return processActorData(finalActor, cleanSlug);
        }
      }
    }
  } catch (err: any) {
    console.error(` [api-server] Drizzle failed, falling back to Supabase SDK:`, err.message);
  }

  // SDK Fallback (v2.14.546)
  try {
    console.error(` [api-server] Executing Supabase SDK fallback for ${isNumericId ? 'ID' : 'slug'}: ${cleanSlug}`);
    const query = supabase.from('actors').select('*');
    
    if (isNumericId) {
      query.eq('id', parseInt(cleanSlug));
    } else {
      query.eq('slug', cleanSlug);
    }
    
    const { data: sdkActor } = await query.maybeSingle();
    
    if (sdkActor) {
      console.error(` [api-server] SUCCESS: Found actor ${sdkActor.first_name} by ${isNumericId ? 'ID' : 'slug'} (SDK).`);
      return processActorData(sdkActor, cleanSlug);
    }
  } catch (sdkErr: any) {
    console.error(` [api-server] Supabase SDK fallback failed:`, sdkErr.message);
  }

  console.error(` [api-server] Actor NOT FOUND for ${isNumericId ? 'ID' : 'slug'}: "${cleanSlug}"`);
  throw new Error("Actor not found");
}

/**
 * 🛡️ CHRIS-PROTOCOL: Process Actor Data (Internal Helper)
 */
async function processActorData(actor: any, slug: string): Promise<Actor> {
  console.error(` [api-server] processActorData START for ${actor.first_name} (ID: ${actor.id})`);
  
  // Fetch relations via Drizzle for stability (v2.14.548)
  let mappedDemos: any[] = [];
  let mappedVideos: any[] = [];

  try {
    const { db: directDb, actorDemos: demosTable, actorVideos: videosTable } = await import('@/lib/system/voices-config');
    const [demos, videos] = await Promise.all([
      directDb.select().from(demosTable).where(and(eq(demosTable.actorId, actor.id), eq(demosTable.is_public, true))),
      directDb.select().from(videosTable).where(and(eq(videosTable.actorId, actor.id), eq(videosTable.is_public, true)))
    ]);

    mappedDemos = (demos || []).map((d: any) => ({
      id: d.id,
      title: d.name,
      audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
      category: d.type || 'demo',
      status: d.status || 'approved'
    }));

    mappedVideos = (videos || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      url: v.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(v.url)}` : v.url,
      type: v.type || 'portfolio'
    }));
  } catch (err: any) {
    console.warn(` [api-server] processActorData: Drizzle relations failed, using empty arrays:`, err.message);
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
  const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;

  // Prioritize dropboxUrl for photo
  let photoUrl = '';
  if (actor.dropbox_url) {
    photoUrl = actor.dropbox_url.startsWith('http') ? actor.dropbox_url : `/api/proxy/?path=${encodeURIComponent(actor.dropbox_url)}`;
  } else if (actor.photo_id) {
    try {
      const { db: directDb, media: mediaTable } = await import('@/lib/system/voices-config');
      const [mediaItem] = await directDb.select().from(mediaTable).where(eq(mediaTable.id, actor.photo_id)).limit(1);
      if (mediaItem) {
        const fp = mediaItem.fileName || mediaItem.filePath; // Use fileName as fallback
        if (fp) photoUrl = fp.startsWith('http') ? fp : `${SUPABASE_STORAGE_URL}/${fp}`;
      }
    } catch (e) {}
  }

  console.error(` [api-server] processActorData SUCCESS for ${actor.first_name}`);

  // 🛡️ CHRIS-PROTOCOL: Fetch language details for Handshake Truth (v2.14.656)
  let nativeLang = '';
  let nativeLangLabel = '';
  let extraLangs = '';
  
  // 🛡️ CHRIS-PROTOCOL: Handshake Truth Resolution (v2.14.676)
  let statusLabel = 'live';
  let statusCode = 'live';
  let experienceLabel = 'pro';
  let experienceCode = 'pro';
  let countryLabel = 'België';
  let countryCode = 'BE';

  if (actor.native_language_id || actor.id) {
    try {
      const { 
        db: directDb, 
        languages: langsTable, 
        actorLanguages: actorLangsTable,
        actorStatuses: statusesTable,
        experienceLevels: expTable,
        countries: countriesTable
      } = await import('@/lib/system/voices-config');
      
      // Fetch native lang
      if (actor.native_language_id) {
        const [langInfo] = await directDb.select().from(langsTable).where(eq(langsTable.id, actor.native_language_id)).limit(1);
        if (langInfo) {
          nativeLang = langInfo.code;
          nativeLangLabel = langInfo.label;
        }
      }

      // Fetch status handshake
      if (actor.status_id) {
        const [statusInfo] = await directDb.select().from(statusesTable).where(eq(statusesTable.id, actor.status_id)).limit(1);
        if (statusInfo) {
          statusLabel = statusInfo.label;
          statusCode = statusInfo.code;
        }
      }

      // Fetch experience handshake
      if (actor.experience_level_id) {
        const [expInfo] = await directDb.select().from(expTable).where(eq(expTable.id, actor.experience_level_id)).limit(1);
        if (expInfo) {
          experienceLabel = expInfo.label;
          experienceCode = expInfo.code;
        }
      }

      // Fetch country handshake
      if (actor.country_id) {
        const [countryInfo] = await directDb.select().from(countriesTable).where(eq(countriesTable.id, actor.country_id)).limit(1);
        if (countryInfo) {
          countryLabel = countryInfo.label;
          countryCode = countryInfo.code;
        }
      }

      // Fetch extra langs via Handshake (v2.14.658)
      const extraLangsData = await directDb
        .select({ code: langsTable.code })
        .from(actorLangsTable)
        .innerJoin(langsTable, eq(actorLangsTable.languageId, langsTable.id))
        .where(and(eq(actorLangsTable.actorId, actor.id), eq(actorLangsTable.isNative, false)));
      
      if (extraLangsData.length > 0) {
        extraLangs = extraLangsData.map((l: any) => l.code).join(', ');
      }
    } catch (e) {}
  }

  return {
    ...actor,
    id: actor.wp_product_id || actor.id,
    display_name: actor.first_name,
    first_name: actor.first_name,
    last_name: actor.last_name || '',
    native_lang_id: actor.native_language_id,
    native_lang: nativeLang,
    native_lang_label: nativeLangLabel,
    extra_langs: extraLangs,
    status: statusLabel,
    status_code: statusCode,
    experience_level: experienceLabel,
    experience_level_code: experienceCode,
    country: countryLabel,
    country_code: countryCode,
    photo_url: photoUrl,
    starting_price: parseFloat(actor.price_unpaid || '0'),
    voice_score: actor.voice_score || 10,
    demos: mappedDemos,
    actor_videos: mappedVideos,
    rates: actor.rates || {}
  } as any;
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data: musicMedia, error } = await supabase
    .from('media')
    .select('*')
    .eq('category', category)
    .limit(50);

  if (error) {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch music library for category: ${category}`,
      stack: error.message,
      component: 'api-server:getMusicLibrary',
      level: 'error'
    });
    return [];
  }

  return (musicMedia || []).map(m => ({ 
    id: m.id.toString(), 
    title: m.file_name || m.fileName, 
    preview: m.file_path || m.filePath 
  }));
}

export async function getAcademyLesson(id: string): Promise<any> {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('display_order', parseInt(id))
    .single();

  if (error) {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch academy lesson for id: ${id}`,
      stack: error.message,
      component: 'api-server:getAcademyLesson',
      level: 'error'
    });
    return null;
  }

  return lesson || null;
}

export async function getFaqs(category: string, limit: number = 5): Promise<any[]> {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .eq('category', category)
    .eq('is_public', true)
    .limit(limit);

  if (error) {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch faqs for category: ${category}`,
      stack: error.message,
      component: 'api-server:getFaqs',
      level: 'error'
    });
    return [];
  }

  return data || [];
}

export async function getWorkshops(limit: number = 50): Promise<any[]> {
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data: workshopsData, error } = await supabase
    .from('workshops')
    .select(`
      *,
      media:media_id(*),
      editions:workshop_editions(
        *,
        instructor:instructors(id, name, first_name, last_name, bio, photo_url),
        location:locations(id, name, address, city, zip, country)
      )
    `)
    .eq('status', 'live')
    .order('id', { ascending: true })
    .limit(limit);

  if (error) {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch workshops`,
      stack: error.message,
      component: 'api-server:getWorkshops',
      level: 'error'
    });
    return [];
  }

  // 🛡️ CHRIS-PROTOCOL: Filter out past editions and sort by date
  const now = new Date().toISOString();
  return (workshopsData || []).map(w => ({
    ...w,
    editions: (w.editions || [])
      .filter((e: any) => e.date >= now && e.status !== 'cancelled')
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
  }));
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
  // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
  const { data: productsData, error } = await supabase
    .from('products')
    .select('*')
    .limit(10);

  if (error) {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Failed to fetch products`,
      stack: error.message,
      component: 'api-server:getProducts',
      level: 'error'
    });
    return [];
  }

  return productsData || [];
}
