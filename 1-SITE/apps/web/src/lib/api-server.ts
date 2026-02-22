import { MarketManager } from "@config/market-manager";
import { db } from "@db";
//  CHRIS-PROTOCOL: Source of Truth from Drizzle Schema
import { actors, actorVideos, contentArticles, contentBlocks, faq, lessons, media, products, reviews, translations } from "@db/schema";
import { createClient } from "@supabase/supabase-js";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
    Actor,
    SearchResults,
} from "../types";
import { VoiceglotBridge } from "./voiceglot-bridge";

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
  // We gebruiken een harde fallback voor Youssef zolang de artists tabel niet live is in Supabase.
  if (slug === 'youssef' || slug === 'youssef-zaki') {
    return {
      id: 2560,
      display_name: 'Youssef Zaki',
      first_name: 'Youssef',
      last_name: 'Zaki',
      slug: 'youssef',
      bio: 'Youssef Zaki is een getalenteerde zanger en artist.',
      photo_url: '/assets/common/branding/founder/youssef-photo.jpg',
      donation_goal: 5000,
      donation_current: 1250,
      youtube_url: 'https://www.youtube.com/@youssefzaki',
      status: 'active',
      is_public: true,
      demos: [],
      iapContext: { genre: 'Pop' }
    };
  }

  const artist = await db.query.artists.findFirst({
    where: eq(artists.slug, slug),
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
    youtube_url: artist.youtubeUrl || '',
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
// We use a global variable to persist cache across requests in the same lambda instance
function getGlobalCache() {
  if (typeof window !== 'undefined') return { actorsCache: {}, translationCache: {} };
  
  const g = global as any;
  if (!g.apiServerCache) {
    g.apiServerCache = {
      actorsCache: {},
      translationCache: {}
    };
  }
  return g.apiServerCache;
}

const ACTORS_CACHE_TTL = 1000 * 5; // 5 seconds (reduced for debugging)

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl'): Promise<SearchResults> {
  console.log(' API: getActors called with params:', params);
  const { language, search, gender, style, market } = params;
  
  const cache = getGlobalCache();
  
  // 1. Check Cache
  const cacheKey = JSON.stringify({ params, lang });
  const cached = cache.actorsCache[cacheKey];
  if (cached && (Date.now() - cached.timestamp) < ACTORS_CACHE_TTL) {
    console.log(` [getActors] Returning cached results for ${cacheKey}`);
    return cached.data;
  }

  console.log(` [getActors] Cache miss for ${cacheKey}, querying DB...`);

  try {
    const lowLang = language?.toLowerCase() || '';
    const dbLang = language ? MarketManager.getLanguageCode(lowLang) : null;
    console.log(' [getActors] language:', language, 'lowLang:', lowLang, 'dbLang:', dbLang);
    const lowGender = gender?.toLowerCase() || '';
    const dbGender = gender ? (lowGender.includes('mannelijk') ? 'male' : lowGender.includes('vrouwelijk') ? 'female' : lowGender) : null;
    
    //  CHRIS-PROTOCOL: Debug log in terminal (server-side)
    console.log(' API: getActors internal params:', { 
      language, 
      dbLang, 
      market,
      search,
      gender,
      dbGender,
      media: params.media,
      lang // Prop lang
    });

    console.log(' API: Querying all live actors with relations...');
    
    //  CHRIS-PROTOCOL: Build filter conditions
    const conditions = [];
    
    // Alleen live acteurs tonen op de frontend
    // @ts-ignore
    conditions.push(eq(actors.status, 'live'));
    
    // 🛡️ CHRIS-PROTOCOL: Language filter is mandatory for the initial load to prevent empty lists
    // We match on nativeLang OR extraLangs (via sub-query or simple ilike)
    if (dbLang || lang) {
      const targetLang = dbLang || lang;
      const langConditions = [
        ilike(actors.nativeLang, targetLang),
        ilike(actors.nativeLang, `${targetLang}-%`),
        //  CHRIS-PROTOCOL: Also match common variations in SQL for broader initial set
        targetLang === 'nl-be' || targetLang === 'nl' ? ilike(actors.nativeLang, 'vlaams') : undefined,
        targetLang === 'nl-nl' || targetLang === 'nl' ? ilike(actors.nativeLang, 'nederlands') : undefined,
        targetLang === 'fr-fr' || targetLang === 'fr' ? ilike(actors.nativeLang, 'frans') : undefined,
        targetLang === 'en-gb' || targetLang === 'en' ? ilike(actors.nativeLang, 'engels') : undefined
      ].filter(Boolean) as any[];
      
      if (langConditions.length > 0) {
        conditions.push(or(...langConditions) as any);
      }
    }
    
    if (dbGender) {
      conditions.push(eq(actors.gender, dbGender));
    }

    console.log(' API: Executing findMany with conditions:', conditions.length);
    console.log(' API: Conditions details:', JSON.stringify(conditions.map(c => c ? 'condition' : 'null')));
    
    if (!db.query || !db.query.actors) {
      console.error(' API: db.query.actors is not available! Drizzle initialization might have failed.');
      throw new Error('Database query engine not available');
    }
    
    // 🛡️ CHRIS-PROTOCOL: Use a timeout for heavy actor queries
    let dbResults: any[] = [];
    try {
      dbResults = await Promise.race([
        db.query.actors.findMany({
          columns: {
            id: true,
            wpProductId: true,
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            nativeLang: true,
            countryId: true,
            deliveryTime: true,
            extraLangs: true,
            bio: true,
            whyVoices: true,
            tagline: true,
            toneOfVoice: true,
            photoId: true,
            logoId: true,
            voiceScore: true,
            totalSales: true,
            priceUnpaid: true,
            priceOnline: true,
            priceIvr: true,
            priceLiveRegie: true,
            dropboxUrl: true,
            status: true,
            isPublic: true,
            isAi: true,
            elevenlabsId: true,
            internalNotes: true,
            createdAt: true,
            updatedAt: true,
            slug: true,
            youtubeUrl: true,
            menuOrder: true,
            rates: true,
            deliveryDaysMin: true,
            deliveryDaysMax: true,
            cutoffTime: true,
            samedayDelivery: true,
            pendingBio: true,
            pendingTagline: true,
            experienceLevel: true,
            studioSpecs: true,
            connectivity: true,
            availability: true,
            isManuallyEdited: true,
            website: true,
            clients: true,
            linkedin: true,
            birthYear: true,
            location: true,
            aiTags: true,
            deliveryDateMin: true,
            deliveryDateMinPriority: true,
            // allowFreeTrial: true
          },
          // @ts-ignore
          where: and(...conditions),
          orderBy: [
            asc(actors.menuOrder), 
            desc(actors.deliveryDateMinPriority),
            sql`delivery_date_min ASC NULLS LAST`, 
            desc(actors.totalSales),
          desc(actors.voiceScore), 
          asc(actors.firstName)
        ],
        limit: 100,
        with: {
          demos: {
            limit: 5,
            where: eq(actorDemos.isPublic, true)
          },
          country: true,
          actorLanguages: {
            with: {
              language: true
            }
          },
          actorTones: {
            with: {
              tone: true
            }
          }
        }
      }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 12000))
      ]) as any[];
    } catch (dbError) {
      console.error(' [getActors] DB Query failed, checking for stale cache fallback...', dbError);
      if (cached) {
        console.log(' [getActors] SUCCESS: Serving stale cache fallback to prevent empty list.');
        return cached.data;
      }
      throw dbError; // No cache and no DB, still have to throw
    }

    console.log(' API: DB returned', dbResults.length, 'results');
    
    const photoIds = Array.from(new Set(dbResults.map(a => a.photoId).filter(Boolean).map(id => Number(id))));
    
    //  CHRIS-PROTOCOL: Photo-Matcher Logic
    // If a search query is present, we try to match it with actor visual tags
    const searchVibe = search?.toLowerCase() || '';

    // Fetch reviews, translations and media in batch
    const [reviewsRes, transRes, mediaRes] = await Promise.all([
      db.select().from(reviews)
        .where(
          and(
            eq(reviews.businessSlug, 'voices-be'), // Alleen Agency reviews
            params.sector ? eq(reviews.sector, params.sector) : undefined,
            params.persona ? eq(reviews.persona, params.persona) : undefined
          )
        )
        .orderBy(desc(reviews.sentimentVelocity), desc(reviews.createdAt))
        .limit(100),
      VoiceglotBridge.translateBatch([...dbResults.map(a => a.bio || ''), ...dbResults.map(a => a.tagline || '')].filter(Boolean), lang),
      photoIds.length > 0
        ? db.select().from(media).where(sql`${media.id} IN (${sql.join(photoIds, sql`, `)})`)
        : Promise.resolve([])
    ]);

    console.log(' API: reviewsRes count:', reviewsRes.length);

    // CHRIS-PROTOCOL: Fallback to general reviews if specific sector matching returns too few results
    let finalDbReviews = reviewsRes;
    if (finalDbReviews.length < 10 && (params.sector || params.persona)) {
      const fallbackReviews = await db.select().from(reviews)
        .where(eq(reviews.businessSlug, 'voices-be'))
        .orderBy(desc(reviews.sentimentVelocity), desc(reviews.createdAt))
        .limit(50);
      finalDbReviews = [...new Set([...finalDbReviews, ...fallbackReviews])].slice(0, 50);
    }

    console.log(' API: finalDbReviews count:', finalDbReviews.length);

    const dbReviews = finalDbReviews.filter(r => r && (r.businessSlug === 'voices-be' || !r.businessSlug || r.businessSlug === 'NULL' || r.businessSlug === null || r.businessSlug === 'voices-studio' || r.businessSlug === 'voices-be') && (r.textNl || r.textEn || r.textFr || r.textDe)).slice(0, 30);
    
    console.log(' API: dbReviews count after filter:', dbReviews.length);
    if (dbReviews.length > 0) {
      console.log(' API: First review businessSlug:', dbReviews[0].businessSlug);
    }
    const translationMap = transRes as Record<string, string>;
    const mediaResults = mediaRes || [];

    //  NUCLEAR CALCULATION: Real-time review statistics
    const reviewStats = await getReviewStats('voices-be');

    // Get unique languages for filters
    const uniqueLangs = Array.from(new Set(dbResults.map(a => a.nativeLang))).filter(Boolean) as string[];

    const mappedResults = dbResults.map((actor) => {
      //  CHRIS-PROTOCOL: The photo_id in the database is the ABSOLUTE Source of Truth
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
      const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;
      
      let photoUrl = '';
      if (actor.photoId) {
        const mediaItem = mediaResults.find(m => m.id === actor.photoId);
        if (mediaItem) {
          const fp = mediaItem.filePath;
          if (fp && (fp.startsWith('agency/') || fp.startsWith('active/') || fp.startsWith('common/') || fp.startsWith('visuals/'))) {
            photoUrl = `${SUPABASE_STORAGE_URL}/${fp}`;
          } else if (fp) {
            photoUrl = fp;
          }
        }
      }

      if (!photoUrl && actor.dropboxUrl) {
        if (actor.dropboxUrl.includes('supabase.co/storage/v1/object/public/voices/')) {
          photoUrl = actor.dropboxUrl;
        } else if (actor.dropboxUrl.startsWith('visuals/') || actor.dropboxUrl.startsWith('agency/') || actor.dropboxUrl.startsWith('active/') || actor.dropboxUrl.startsWith('common/')) {
          photoUrl = `${SUPABASE_STORAGE_URL}/${actor.dropboxUrl}`;
        } else if (actor.dropboxUrl.startsWith('/api/proxy')) {
          photoUrl = actor.dropboxUrl;
        } else {
          const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';
          photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE}${actor.dropboxUrl}`;
        }
      }

      const proxiedPhoto = photoUrl.includes('supabase.co') || photoUrl.includes('/api/proxy') ? photoUrl : (photoUrl ? `/api/proxy/?path=${encodeURIComponent(photoUrl)}` : '');
      
      //  LOUIS-MANDATE: Photo-Matcher Visual Selection
      // If the actor has multiple photos in metadata, select the one that matches the search vibe
      let matchedPhotoUrl = proxiedPhoto;
      if (searchVibe && actor.aiTags && Array.isArray(actor.aiTags)) {
        const matchingTag = (actor.aiTags as any[]).find(tag => 
          tag.vibe?.toLowerCase().includes(searchVibe) || 
          tag.label?.toLowerCase().includes(searchVibe)
        );
        if (matchingTag?.photoUrl) {
          matchedPhotoUrl = matchingTag.photoUrl.startsWith('http') 
            ? matchingTag.photoUrl 
            : `/api/proxy/?path=${encodeURIComponent(matchingTag.photoUrl)}`;
        }
      }

      const proxiedDemos = (actor.demos || []).map((d: any) => ({
        id: d.id,
        title: d.name,
        audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
        category: d.type || 'demo',
        status: d.status || 'approved'
      }));

      const translatedBio = translationMap[actor.bio || ''] || actor.bio || '';
      const translatedTagline = translationMap[actor.tagline || ''] || actor.tagline || '';

      const nativeLangObj = actor.actorLanguages?.find((al: any) => al.isNative)?.language;
      const extraLangIds = actor.actorLanguages?.filter((al: any) => !al.isNative).map((al: any) => al.languageId);
      const tonesList = actor.actorTones?.map((at: any) => at.tone?.label);
      const toneIds = actor.actorTones?.map((at: any) => at.toneId);

      if (!nativeLangObj?.id) {
        console.warn(`[api-server] Actor ${actor.id} (${actor.firstName}) missing native_lang_id`);
      }

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        last_name: actor.lastName || '',
        slug: actor.firstName?.toLowerCase() || (actor as any).first_name?.toLowerCase(),
        gender: actor.gender,
        native_lang: nativeLangObj?.code || actor.nativeLang,
        native_lang_id: nativeLangObj?.id || null, //  Harde ID matching
        extra_lang_ids: extraLangIds || [], //  Harde ID matching
        tone_ids: toneIds || [], //  Harde ID matching
        country_id: actor.countryId || null, //  Harde ID matching
        photo_url: matchedPhotoUrl || proxiedPhoto,
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        voice_score: actor.voiceScore || 10,
        total_sales: actor.totalSales || 0,
        menu_order: actor.menuOrder || 0,
        ai_enabled: actor.isAi,
        bio: translatedBio.replace(/<[^>]*>?/gm, '').trim(),
        tagline: translatedTagline.replace(/<[^>]*>?/gm, '').trim(),
        tone_of_voice: tonesList?.join(', ') || actor.toneOfVoice || '',
        delivery_days_min: actor.deliveryDaysMin || 1,
        delivery_days_max: actor.deliveryDaysMax || 3,
        cutoff_time: actor.cutoffTime || '18:00',
        availability: actor.availability as any[] || [],
        holiday_from: actor.holidayFrom || '',
        holiday_till: actor.holidayTill || '',
        delivery_date_min: actor.deliveryDateMin,
        delivery_date_min_priority: actor.deliveryDateMinPriority,
        delivery_config: actor.deliveryConfig as any,
        // allow_free_trial: actor.allowFreeTrial ?? true,
        demos: proxiedDemos,
        rates: actor.rates || {},
        price_ivr: actor.priceIvr,
        price_unpaid: actor.priceUnpaid,
        price_live_regie: actor.priceLiveRegie
      };
    });

    // Priority languages sorting
    const priorityLangs = ['Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans', 'Italiaans', 'Pools', 'Portugees', 'Turks', 'Deens', 'Zweeds', 'Noors', 'Fins', 'Grieks', 'Russisch', 'Arabisch', 'Chinees', 'Japans'];
    const otherLangs = uniqueLangs.filter(l => !priorityLangs.includes(l)).sort();
    const finalLangs = [...priorityLangs.filter(l => uniqueLangs.includes(l)), ...otherLangs];

    const result: SearchResults = {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: {
        genders: ['Mannelijk', 'Vrouwelijk'],
        languages: finalLangs,
        styles: ['Corporate', 'Commercial', 'Narrative', 'Energetic', 'Warm']
      },
      _nuclear: true,
      _source: 'database',
      reviews: dbReviews.map(r => {
        const reviewDate = r.createdAt ? new Date(r.createdAt) : new Date();
        return {
          id: r.id,
          name: r.authorName,
          text: r.textNl || r.textEn || r.textFr || r.textDe || '',
          authorUrl: r.authorUrl,
          authorPhotoUrl: r.authorPhotoUrl,
          author_photo_url: r.authorPhotoUrl,
          rating: r.rating,
          sector: r.sector,
          persona: r.persona,
          isHero: r.isHero,
          businessSlug: r.businessSlug,
          status: r.language === 'hidden' ? 'hidden' : 'published', // We gebruiken language als proxy voor status in de DB voor nu
          date: reviewDate.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
          rawDate: r.createdAt
        };
      }),
      reviewStats: reviewStats
    };

    // 2. Update Cache
    cache.actorsCache[cacheKey] = { data: result, timestamp: Date.now() };

    return result;
  } catch (error: any) {
    console.error('[getActors FATAL ERROR]:', error);
    throw error;
  }
}

export async function getArticle(slug: string, lang: string = 'nl'): Promise<any> {
  const results = await db.select().from(contentArticles).where(eq(contentArticles.slug, slug)).limit(1);
  const article = results[0];
  
  if (!article) {
    console.warn(`[api-server] Article not found for slug: ${slug}`);
    return null;
  }

  const translatedTitle = await VoiceglotBridge.t(`page.${slug}.title`, lang, true);
  const blocks = await db.select().from(contentBlocks).where(eq(contentBlocks.articleId, article.id)).orderBy(asc(contentBlocks.displayOrder));

  return {
    ...article,
    title: translatedTitle,
    blocks: blocks
  };
}

export async function getActor(slug: string, lang: string = 'nl'): Promise<Actor> {
  console.log(' API: Querying actor with relations:', slug);
  const actor = await db.query.actors.findFirst({
    columns: {
      id: true,
      wpProductId: true,
      userId: true,
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
      nativeLang: true,
      countryId: true,
      deliveryTime: true,
      extraLangs: true,
      bio: true,
      whyVoices: true,
      tagline: true,
      toneOfVoice: true,
      photoId: true,
      logoId: true,
      voiceScore: true,
      totalSales: true,
      priceUnpaid: true,
      priceOnline: true,
      priceIvr: true,
      priceLiveRegie: true,
      dropboxUrl: true,
      status: true,
      isPublic: true,
      isAi: true,
      elevenlabsId: true,
      internalNotes: true,
      createdAt: true,
      updatedAt: true,
      slug: true,
      youtubeUrl: true,
      menuOrder: true,
      rates: true,
      deliveryDaysMin: true,
      deliveryDaysMax: true,
      cutoffTime: true,
      samedayDelivery: true,
      pendingBio: true,
      pendingTagline: true,
      experienceLevel: true,
      studioSpecs: true,
      connectivity: true,
      availability: true,
      isManuallyEdited: true,
      website: true,
      clients: true,
      linkedin: true,
      birthYear: true,
      location: true,
      aiTags: true,
      deliveryDateMin: true,
      deliveryDateMinPriority: true
    },
    where: eq(actors.slug, slug),
    with: {
      actorLanguages: {
        with: {
          language: true
        }
      },
      actorTones: {
        with: {
          tone: true
        }
      },
      country: true,
      demos: true,
      videos: true
    }
  });

  if (!actor) {
    console.warn(`[api-server] Actor not found for slug: ${slug}`);
    throw new Error("Actor not found");
  }

  const [reviewsRes, mediaRes] = await Promise.all([
    db.select().from(reviews).where(eq(reviews.businessSlug, slug)).limit(10),
    actor.photoId ? db.select().from(media).where(eq(media.id, actor.photoId)).limit(1) : Promise.resolve([])
  ]);
  
  const dbReviews = reviewsRes;
  const mediaItem = mediaRes[0] || null;
  const actorVideosList = actor.videos || [];

  const ASSET_BASE_GLOBAL = process.env.NEXT_PUBLIC_BASE_URL || '';
  const SUPABASE_URL_GLOBAL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
  const SUPABASE_STORAGE_URL_GLOBAL = `${SUPABASE_URL_GLOBAL.replace(/\/$/, '')}/storage/v1/object/public/voices`;
  
  let photoUrl = '';
  if (actor.photoId && mediaItem) {
    const fp = mediaItem.filePath;
    if (fp && (fp.startsWith('agency/') || fp.startsWith('active/') || fp.startsWith('common/') || fp.startsWith('visuals/'))) {
      photoUrl = `${SUPABASE_STORAGE_URL_GLOBAL}/${fp}`;
    } else if (fp) {
      photoUrl = fp.startsWith('http') ? fp : `/api/proxy/?path=${encodeURIComponent(fp)}`;
    }
  }
  
  if (!photoUrl && actor.dropboxUrl) {
    if (actor.dropboxUrl.includes('supabase.co/storage/v1/object/public/voices/')) {
      photoUrl = actor.dropboxUrl;
    } else if (actor.dropboxUrl.startsWith('visuals/') || actor.dropboxUrl.startsWith('agency/') || actor.dropboxUrl.startsWith('active/') || actor.dropboxUrl.startsWith('common/')) {
      photoUrl = `${SUPABASE_STORAGE_URL_GLOBAL}/${actor.dropboxUrl}`;
    } else if (actor.dropboxUrl.startsWith('/api/proxy')) {
      photoUrl = actor.dropboxUrl;
    } else {
      photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE_GLOBAL}${actor.dropboxUrl}`;
    }
  }

  const translatedBio = await VoiceglotBridge.t(actor.bio || '', lang);
  const nativeLangObj = actor.actorLanguages?.find((al: any) => al.isNative)?.language;
  const extraLangsList = actor.actorLanguages?.filter((al: any) => !al.isNative).map((al: any) => al.language?.code);
  const tonesList = actor.actorTones?.map((at: any) => at.tone?.label);

  const proxiedDemos = (actor.demos || []).map((d: any) => ({
    id: d.id,
    title: d.name,
    audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
    category: d.type || 'demo',
    status: d.status || 'approved'
  }));

  return {
    id: actor.wpProductId || actor.id,
    display_name: actor.firstName,
    first_name: actor.firstName,
    last_name: actor.lastName || '',
    slug: actor.firstName?.toLowerCase(),
    gender: actor.gender || '',
    native_lang: nativeLangObj?.code || actor.nativeLang,
    photo_url: photoUrl,
    description: actor.bio,
    website: actor.website,
    linkedin: actor.linkedin,
    status: actor.status,
    starting_price: parseFloat(actor.priceUnpaid || '0'),
    price_ivr: parseFloat(actor.priceIvr || '0'),
    price_online: parseFloat(actor.priceOnline || '0'),
    rates: actor.rates || {},
    pending_rates: actor.pendingRates || {},
    voice_score: actor.voiceScore || 10,
    total_sales: actor.totalSales || 0,
    menu_order: actor.menuOrder || 0,
    ai_enabled: actor.isAi || false,
    ai_tags: actor.aiTags || '',
    bio: (actor.pendingBio || translatedBio).replace(/<[^>]*>?/gm, '').trim(),
    tagline: (actor.pendingTagline || (actor as any).tagline)?.replace(/<[^>]*>?/gm, '').trim() || '',
    pending_bio: actor.pendingBio,
    pending_tagline: actor.pendingTagline,
    price_unpaid: parseFloat(actor.priceUnpaid || '0'),
    delivery_days_min: actor.deliveryDaysMin || 1,
    delivery_days_max: actor.deliveryDaysMax || 3,
    cutoff_time: actor.cutoffTime || '18:00',
    availability: actor.availability as any[] || [],
    holiday_from: actor.holidayFrom || '',
    holiday_till: actor.holidayTill || '',
    delivery_date_min: actor.deliveryDateMin,
    delivery_date_min_priority: actor.deliveryDateMinPriority,
    delivery_config: actor.deliveryConfig as any,
    extra_langs: extraLangsList?.join(', ') || actor.extraLangs || '',
    extra_langs_labels: (extraLangsList?.join(', ') || actor.extra_langs || '').split(',').map(l => MarketManager.getLanguageLabel(l.trim())).join(', '),
    native_lang_label: nativeLangObj?.label || MarketManager.getLanguageLabel(actor.nativeLang || ''),
    styles: tonesList || [],
    languages: [
      { name: nativeLangObj?.label || MarketManager.getLanguageLabel(actor.nativeLang || '') },
      ...(extraLangsList || []).map(l => ({ name: MarketManager.getLanguageLabel(l) }))
    ],
    reviews: dbReviews.map(r => ({
      id: r.id,
      name: r.authorName,
      authorName: r.authorName,
      text: r.textNl || r.textEn || '',
      textNl: r.textNl,
      rating: r.rating,
      provider: r.provider,
      authorPhotoUrl: r.authorPhotoUrl,
      sector: r.sector,
      persona: r.persona,
      date: new Date(r.createdAt!).toLocaleDateString('nl-BE')
    })),
    actor_videos: actorVideosList.map(v => ({
      id: v.id,
      name: v.name,
      url: v.url,
      status: v.status || 'approved'
    })),
    demos: proxiedDemos
  };
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  const musicMedia = await db.select().from(media).where(
    and(
      eq(media.category, category),
      sql`${media.metadata}->>'vibe' = 'Onze eigen muziek'`
    )
  ).orderBy(media.fileName);

  const mappedMedia = (musicMedia || []).map(m => {
    let title = m.altText;
    if (!title) {
      title = m.fileName
        .replace('.mp3', '')
        .replace('.wav', '')
        .replace(/-/g, ' ')
        .replace(/_preview/gi, '')
        .replace(/music-/gi, '')
        .trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    const genre = m.labels?.find(l => !['audio', 'music', 'auto-migrated', 'filesystem-sync'].includes(l)) || 'Algemeen';
    return {
      id: m.id.toString(),
      title: title,
      vibe: genre,
      preview: m.filePath.startsWith('http') ? m.filePath : `/${m.filePath}`
    };
  });

  const unique = mappedMedia.filter((item, index, self) =>
    index === self.findIndex((t) => t.title.toLowerCase() === item.title.toLowerCase())
  );

  return unique.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAcademyLesson(id: string): Promise<any> {
  const lessonOrder = parseInt(id);
  if (isNaN(lessonOrder)) return null;

  try {
    const results = await db.select().from(lessons).where(eq(lessons.displayOrder, lessonOrder)).limit(1);
    const lesson = results[0];
    
    if (!lesson) {
      console.warn(`[api-server] Academy lesson not found for id: ${id}`);
      return null;
    }

    return {
      id: lesson.id,
      header: {
        title: lesson.title,
        subtitle: lesson.description || ""
      },
      video_url: lesson.videoUrl,
      exercise: lesson.content,
      intro_script: lesson.introScript,
      deep_dive_script: lesson.deepDiveScript,
      progress: {
        percentage: 0
      }
    };
  } catch (error) {
    console.error(`❌ getAcademyLesson: Failed to fetch lesson ${id}:`, error);
    return null;
  }
}

export async function getFaqs(category: string, limit: number = 5): Promise<any[]> {
  const data = await db.select().from(faq).where(
    and(
      eq(faq.category, category),
      eq(faq.isPublic, true)
    )
  ).limit(limit);
  
  return (data || []).map(f => ({
    ...f,
    id: f.id,
    questionNl: f.questionNl,
    answerNl: f.answerNl,
    isPublic: f.isPublic
  }));
}

export async function getWorkshops(limit: number = 50): Promise<any[]> {
  const workshopsData = await db.query.workshops.findMany({
    limit,
    where: (fields, { and, notLike }) => and(
      notLike(fields.slug, '%academy%'),
      notLike(fields.slug, '%op-maat%'),
      notLike(fields.slug, '%intonatie%'),
      notLike(fields.slug, '%articulatie%'),
      notLike(fields.slug, '%verwen-je-stem%')
    ),
    orderBy: (fields, { desc }) => [desc(fields.date)],
    with: {
      media: true,
      instructor: true,
      editions: {
        where: (fields, { and, eq, gte }) => and(
          eq(fields.status, 'upcoming'),
          gte(fields.date, new Date().toISOString())
        ),
        orderBy: (fields, { asc }) => [asc(fields.date)],
        with: {
          location: true,
          instructor: true
        }
      }
    }
  });
  
  return workshopsData;
}

//  CHRIS-PROTOCOL: In-memory cache for translations to reduce DB load
const CACHE_TTL = 1000 * 60 * 60; // 60 minutes (more aggressive for stability)

export async function getTranslationsServer(lang: string): Promise<Record<string, string>> {
  if (lang === 'nl') return {};
  
  const cache = getGlobalCache();
  
  // 1. Check Cache First
  const cached = cache.translationCache[lang];
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log(` [getTranslationsServer] Returning cached translations for ${lang}`);
    return cached.data;
  }

  console.log(` [getTranslationsServer] Cache miss for ${lang}, querying DB...`);

  let lastError: any = null;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 🛡️ CHRIS-PROTOCOL: Use a timeout for DB queries to prevent 504s
      const data = await Promise.race([
        db.select({
          translationKey: translations.translationKey,
          translatedText: translations.translatedText,
          originalText: translations.originalText
        })
        .from(translations)
        .where(eq(translations.lang, lang)),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 8000))
      ]) as any[];
      
      const translationMap: Record<string, string> = {};
      data?.forEach(row => {
        if (row.translationKey) {
          translationMap[row.translationKey] = row.translatedText || row.originalText || '';
        }
      });
      
      // 2. Update Cache
      cache.translationCache[lang] = {
        data: translationMap,
        timestamp: Date.now()
      };

      return translationMap;
    } catch (error: any) {
      lastError = error;
      console.error(`[getTranslationsServer] Attempt ${attempt} failed for ${lang}:`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }
    
  //  CHRIS-PROTOCOL: Report server-side failure to Watchdog after all retries failed
  // Skip reporting during build phase to avoid connection pool noise
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    const { ServerWatchdog } = await import('./server-watchdog');
    ServerWatchdog.report({
      error: `Server Translation Failure (${lang}): ${lastError?.message || 'Unknown error'}`,
      stack: lastError?.stack,
      component: 'ServerTranslations',
      level: 'critical'
    });
  }

  // Fallback naar leeg object zodat de site niet crasht
  return {};
}

export async function getProducts(category?: string): Promise<any[]> {
  const conditions = [];
  if (category) conditions.push(eq(products.category, category));
  conditions.push(eq(products.status, 'publish'));

  return await db.query.products.findMany({
    where: and(...conditions),
    orderBy: [asc(products.price)],
    with: {
      media: true
    }
  });
}
