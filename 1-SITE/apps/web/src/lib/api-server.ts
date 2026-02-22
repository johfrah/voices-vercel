import { MarketManager } from "@config/market-manager";
import { db } from "@db";
//  CHRIS-PROTOCOL: Source of Truth from Drizzle Schema
import { actors, actorDemos, actorVideos, contentArticles, contentBlocks, faq, lessons, media, products, reviews, translations } from "@db/schema";
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

const ACTORS_CACHE_TTL = 1000 * 60 * 5; // 5 minutes

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
    const lowGender = gender?.toLowerCase() || '';
    const dbGender = gender ? (lowGender.includes('mannelijk') ? 'male' : lowGender.includes('vrouwelijk') ? 'female' : lowGender) : null;
    
    //  CHRIS-PROTOCOL: Build filter conditions
    const conditions = [];
    
    // Alleen live acteurs tonen op de frontend
    // @ts-ignore
    conditions.push(eq(actors.status, 'live'));
    // @ts-ignore
    conditions.push(eq(actors.isPublic, true));
    
    // 🛡️ CHRIS-PROTOCOL: Language filter is mandatory for the initial load to prevent empty lists
    if (dbLang || lang) {
      const targetLang = dbLang || lang;
      const langConditions = [
        ilike(actors.nativeLang, targetLang),
        ilike(actors.nativeLang, `${targetLang}-%`),
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

    // 🛡️ CHRIS-PROTOCOL: Use Supabase SDK for everything for stability on Vercel
    let dbResults: any[] = [];
    try {
      let query = supabase
        .from('actors')
        .select('*')
        .eq('status', 'live')
        .eq('is_public', true);
        
      if (dbLang || lang) {
        const targetLang = dbLang || lang;
        if (targetLang === 'nl') {
          query = query.or('native_lang.ilike.nl,native_lang.ilike.nl-%,native_lang.ilike.vlaams,native_lang.ilike.nederlands');
        } else {
          query = query.or(`native_lang.ilike.${targetLang},native_lang.ilike.${targetLang}-%`);
        }
      }
      
      const { data: sdkData, error: sdkError } = await query.order('menu_order', { ascending: true }).limit(100);
        
      if (sdkError) throw sdkError;
      
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
    const [reviewsRes, mediaRes, demosRes, actorLangsRes, actorTonesRes] = await Promise.all([
      supabase.from('reviews').select('*').eq('business_slug', 'voices-be').limit(30).catch(() => ({ data: [] })),
      photoIds.length > 0 ? supabase.from('media').select('*').in('id', photoIds).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      supabase.from('actor_demos').select('*').in('actor_id', actorIds).eq('is_public', true).catch(() => ({ data: [] })),
      supabase.from('actor_languages').select('*, language:languages(*)').in('actor_id', actorIds).catch(() => ({ data: [] })),
      supabase.from('actor_tones').select('*, tone:voice_tones(*)').in('actor_id', actorIds).catch(() => ({ data: [] }))
    ]);
    
    const dbReviewsRaw = (reviewsRes as any).data || [];
    const mediaResults = (mediaRes as any).data || [];
    const demosData = (demosRes as any).data || [];
    const actorLangsData = (actorLangsRes as any).data || [];
    const actorTonesData = (actorTonesRes as any).data || [];
    
    const translationMap: Record<string, string> = {};
    const reviewStats = await getReviewStats('voices-be').catch(() => ({ averageRating: 4.9, totalCount: dbReviewsRaw.length, distribution: {} }));

    const mappedResults = dbResults.map((actor) => {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
      const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;
      
      let photoUrl = '';
      if (actor.photoId) {
        const mediaItem = mediaResults.find((m: any) => m.id === actor.photoId);
        if (mediaItem) {
          const fp = mediaItem.file_path || mediaItem.filePath;
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
      
      const actorDemosList = actor.demos || demosData.filter((d: any) => d.actor_id === actor.id);
      const proxiedDemos = actorDemosList.map((d: any) => ({
        id: d.id,
        title: d.name,
        audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
        category: d.type || 'demo',
        status: d.status || 'approved'
      }));

      const actorLangs = actor.actorLanguages || actorLangsData.filter((al: any) => al.actor_id === actor.id);
      const nativeLangObj = actorLangs.find((al: any) => al.is_native || al.isNative)?.language;
      const extraLangIds = actorLangs.filter((al: any) => !(al.is_native || al.isNative)).map((al: any) => al.language_id || al.languageId);
      
      const actorTones = actor.actorTones || actorTonesData.filter((at: any) => at.actor_id === actor.id);
      const tonesList = actorTones.map((at: any) => at.tone?.label);
      const toneIds = actorTones.map((at: any) => at.tone_id || at.toneId);

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        last_name: actor.lastName || '',
        slug: actor.firstName?.toLowerCase(),
        gender: actor.gender,
        native_lang: nativeLangObj?.code || actor.nativeLang,
        native_lang_id: nativeLangObj?.id || null,
        extra_lang_ids: extraLangIds || [],
        tone_ids: toneIds || [],
        country_id: actor.countryId || null,
        photo_url: proxiedPhoto,
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        voice_score: actor.voiceScore || 10,
        total_sales: actor.totalSales || 0,
        menu_order: actor.menuOrder || 0,
        ai_enabled: actor.isAi,
        bio: (actor.bio || '').replace(/<[^>]*>?/gm, '').trim(),
        tagline: (actor.tagline || '').replace(/<[^>]*>?/gm, '').trim(),
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
        demos: proxiedDemos,
        rates: actor.rates || {},
        price_ivr: actor.priceIvr,
        price_unpaid: actor.priceUnpaid,
        price_live_regie: actor.priceLiveRegie
      };
    });

    const uniqueLangs = Array.from(new Set(dbResults.map(a => a.nativeLang))).filter(Boolean) as string[];
    const priorityLangs = ['Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits'];
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
      reviews: dbReviewsRaw.map((r: any) => {
        const reviewDate = r.created_at || r.createdAt ? new Date(r.created_at || r.createdAt) : new Date();
        return {
          id: r.id,
          name: r.author_name || r.authorName,
          text: r.text_nl || r.text_en || r.text_fr || r.text_de || r.textNl || r.textEn || '',
          authorUrl: r.author_url || r.authorUrl,
          authorPhotoUrl: r.author_photo_url || r.authorPhotoUrl,
          rating: r.rating,
          sector: r.sector,
          persona: r.persona,
          isHero: r.is_hero || r.isHero,
          businessSlug: r.business_slug || r.businessSlug,
          status: 'published',
          date: reviewDate.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
          rawDate: r.created_at || r.createdAt
        };
      }),
      reviewStats: reviewStats
    };

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
  
  if (!article) return null;

  const translatedTitle = await VoiceglotBridge.t(`page.${slug}.title`, lang, true);
  const blocks = await db.select().from(contentBlocks).where(eq(contentBlocks.articleId, article.id)).orderBy(asc(contentBlocks.displayOrder));

  return {
    ...article,
    title: translatedTitle,
    blocks: blocks
  };
}

export async function getActor(slug: string, lang: string = 'nl'): Promise<Actor> {
  const actor = await db.query.actors.findFirst({
    where: eq(actors.slug, slug),
    with: {
      actorLanguages: { with: { language: true } },
      actorTones: { with: { tone: true } },
      country: true,
      demos: true,
      videos: true
    }
  });

  if (!actor) throw new Error("Actor not found");

  const [reviewsRes, mediaRes] = await Promise.all([
    db.select().from(reviews).where(eq(reviews.businessSlug, slug)).limit(10).catch(() => []),
    actor.photoId ? db.select().from(media).where(eq(media.id, actor.photoId)).limit(1).catch(() => []) : Promise.resolve([])
  ]);
  
  const dbReviews = reviewsRes;
  const mediaItem = mediaRes[0] || null;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
  const SUPABASE_STORAGE_URL = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;
  
  let photoUrl = '';
  if (actor.photoId && mediaItem) {
    const fp = mediaItem.filePath;
    if (fp && (fp.startsWith('agency/') || fp.startsWith('active/') || fp.startsWith('common/') || fp.startsWith('visuals/'))) {
      photoUrl = `${SUPABASE_STORAGE_URL}/${fp}`;
    } else if (fp) {
      photoUrl = fp.startsWith('http') ? fp : `/api/proxy/?path=${encodeURIComponent(fp)}`;
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
      photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${process.env.NEXT_PUBLIC_BASE_URL || ''}${actor.dropboxUrl}`;
    }
  }

  const translatedBio = await VoiceglotBridge.t(actor.bio || '', lang);
  const nativeLangObj = actor.actorLanguages?.find((al: any) => al.isNative)?.language;
  const extraLangsList = actor.actorLanguages?.filter((al: any) => !al.isNative).map((al: any) => al.language?.code);
  const tonesList = actor.actorTones?.map((at: any) => at.tone?.label);

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
    voice_score: actor.voiceScore || 10,
    total_sales: actor.totalSales || 0,
    menu_order: actor.menuOrder || 0,
    ai_enabled: actor.isAi || false,
    bio: (actor.pendingBio || translatedBio).replace(/<[^>]*>?/gm, '').trim(),
    tagline: (actor.pendingTagline || (actor as any).tagline)?.replace(/<[^>]*>?/gm, '').trim() || '',
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
      text: r.textNl || r.textEn || '',
      rating: r.rating,
      date: new Date(r.createdAt!).toLocaleDateString('nl-BE')
    })),
    demos: (actor.demos || []).map((d: any) => ({
      id: d.id,
      title: d.name,
      audio_url: d.url?.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
      category: d.type || 'demo',
      status: d.status || 'approved'
    }))
  };
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  const musicMedia = await db.select().from(media).where(
    and(
      eq(media.category, category),
      sql`${media.metadata}->>'vibe' = 'Onze eigen muziek'`
    )
  ).orderBy(media.fileName).catch(() => []);

  const mappedMedia = (musicMedia || []).map(m => {
    let title = m.altText;
    if (!title) {
      title = m.fileName.replace('.mp3', '').replace('.wav', '').replace(/-/g, ' ').replace(/_preview/gi, '').replace(/music-/gi, '').trim();
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

  return mappedMedia.filter((item, index, self) =>
    index === self.findIndex((t) => t.title.toLowerCase() === item.title.toLowerCase())
  ).sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAcademyLesson(id: string): Promise<any> {
  const lessonOrder = parseInt(id);
  if (isNaN(lessonOrder)) return null;

  try {
    const results = await db.select().from(lessons).where(eq(lessons.displayOrder, lessonOrder)).limit(1);
    const lesson = results[0];
    if (!lesson) return null;

    return {
      id: lesson.id,
      header: { title: lesson.title, subtitle: lesson.description || "" },
      video_url: lesson.videoUrl,
      exercise: lesson.content,
      intro_script: lesson.introScript,
      deep_dive_script: lesson.deepDiveScript,
      progress: { percentage: 0 }
    };
  } catch (error) {
    console.error(`❌ getAcademyLesson: Failed to fetch lesson ${id}:`, error);
    return null;
  }
}

export async function getFaqs(category: string, limit: number = 5): Promise<any[]> {
  const data = await db.select().from(faq).where(
    and(eq(faq.category, category), eq(faq.isPublic, true))
  ).limit(limit).catch(() => []);
  
  return (data || []).map(f => ({
    ...f,
    id: f.id,
    questionNl: f.questionNl,
    answerNl: f.answerNl,
    isPublic: f.isPublic
  }));
}

export async function getWorkshops(limit: number = 50): Promise<any[]> {
  const workshopsData = await (db.query as any).workshops.findMany({
    limit,
    where: (fields: any, { and, notLike }: any) => and(
      notLike(fields.slug, '%academy%'),
      notLike(fields.slug, '%op-maat%'),
      notLike(fields.slug, '%intonatie%'),
      notLike(fields.slug, '%articulatie%'),
      notLike(fields.slug, '%verwen-je-stem%')
    ),
    orderBy: (fields: any, { desc }: any) => [desc(fields.date)],
    with: {
      media: true,
      instructor: true,
      editions: {
        where: (fields: any, { and, eq, gte }: any) => and(
          eq(fields.status, 'upcoming'),
          gte(fields.date, new Date().toISOString())
        ),
        orderBy: (fields: any, { asc }: any) => [asc(fields.date)],
        with: { location: true, instructor: true }
      }
    }
  }).catch(() => []);
  
  return workshopsData;
}

const CACHE_TTL = 1000 * 60 * 60; // 60 minutes

export async function getTranslationsServer(lang: string): Promise<Record<string, string>> {
  if (lang === 'nl') return {};
  
  const cache = getGlobalCache();
  const cached = cache.translationCache[lang];
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) return cached.data;

  console.log(` [getTranslationsServer] Cache miss for ${lang}, querying DB...`);

  try {
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
    
    cache.translationCache[lang] = { data: translationMap, timestamp: Date.now() };
    return translationMap;
  } catch (error: any) {
    console.error(`[getTranslationsServer] Failed for ${lang}:`, error.message);
    return {};
  }
}

export async function getProducts(category?: string): Promise<any[]> {
  const conditions = [];
  if (category) conditions.push(eq(products.category, category));
  conditions.push(eq(products.status, 'publish'));

  return await (db.query as any).products.findMany({
    where: and(...conditions),
    orderBy: [asc(products.price)],
    with: { media: true }
  }).catch(() => []);
}
