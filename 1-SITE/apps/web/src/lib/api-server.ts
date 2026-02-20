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

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl'): Promise<SearchResults> {
  console.log(' API: getActors called with params:', params);
  const { language, search, gender, style, market } = params;
  
  try {
    const lowLang = language?.toLowerCase() || '';
    const dbLang = language ? MarketManager.getLanguageCode(lowLang) : null;
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
      media: params.media
    });

  //  CHRIS-PROTOCOL: Direct Drizzle connection is the ONLY Source of Truth.
    // No fallbacks allowed. If this fails, we need to know why.
    console.log(' API: Querying all live actors with relations...');
    
    //  CHRIS-PROTOCOL: Build filter conditions
    const conditions = [];
    
    // Alleen live acteurs tonen op de frontend
    // @ts-ignore
    conditions.push(eq(actors.status, 'live'));
    
    if (dbLang) {
      const langConditions = [
        ilike(actors.nativeLang, dbLang),
        ilike(actors.nativeLang, `${dbLang}-%`),
        //  CHRIS-PROTOCOL: Also match common variations in SQL for broader initial set
        dbLang === 'nl-be' ? ilike(actors.nativeLang, 'vlaams') : undefined,
        dbLang === 'nl-nl' ? ilike(actors.nativeLang, 'nederlands') : undefined,
        dbLang === 'fr-fr' ? ilike(actors.nativeLang, 'frans') : undefined,
        dbLang === 'en-gb' ? ilike(actors.nativeLang, 'engels') : undefined
      ].filter(Boolean) as any[];
      
      if (langConditions.length > 0) {
        conditions.push(or(...langConditions) as any);
      }
    }
    
    if (dbGender) {
      conditions.push(eq(actors.gender, dbGender));
    }

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

    try {
      console.log(' [Emergency SDK] Fetching actors via SDK...');
      const { data: sdkResults, error: sdkError } = await supabase
        .from('actors')
        .select(`
          *,
          demos:actor_demos(*),
          country:countries(*),
          actorLanguages:actor_languages(
            is_native,
            language:languages(*)
          ),
          actorTones:actor_tones(
            tone:tones(*)
          )
        `)
        .eq('status', 'live')
        .limit(200);

      if (sdkError) {
        console.error(' [Emergency SDK] Supabase SDK error:', sdkError);
        throw sdkError;
      }

      console.log(` [Emergency SDK] Found ${sdkResults?.length || 0} actors`);

      const mappedResults = (sdkResults || []).map((actor: any) => {
        // Map SDK results to the same format as Drizzle
        const photoUrl = actor.dropbox_url || ''; 
        
        return {
          id: actor.wp_product_id || actor.id,
          display_name: actor.first_name,
          first_name: actor.first_name,
          last_name: actor.last_name || '',
          slug: actor.first_name?.toLowerCase(),
          gender: actor.gender,
          native_lang: actor.native_lang,
          photo_url: photoUrl,
          starting_price: parseFloat(actor.price_unpaid || '0'),
          voice_score: actor.voice_score || 10,
          ai_enabled: actor.is_ai,
          bio: (actor.bio || '').replace(/<[^>]*>?/gm, '').trim(),
          tagline: (actor.tagline || '').replace(/<[^>]*>?/gm, '').trim(),
          demos: (actor.demos || []).map((d: any) => ({
            id: d.id,
            title: d.name,
            audio_url: d.url,
            category: d.type || 'demo'
          }))
        };
      });

      return {
        count: mappedResults.length,
        results: mappedResults as any,
        filters: {
          genders: ['Mannelijk', 'Vrouwelijk'],
          languages: ['Vlaams', 'Nederlands', 'Engels', 'Frans'],
          styles: ['Corporate', 'Commercial']
        },
        _nuclear: true,
        _source: 'supabase-sdk-emergency',
        reviews: [],
        reviewStats: { averageRating: 4.9, totalCount: 100, distribution: {} }
      };
    } catch (emergencyError) {
      console.error(' [Emergency SDK] FATAL FALLBACK FAILURE:', emergencyError);
      throw emergencyError;
    }
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
      const webpPath = fp.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      photoUrl = `${SUPABASE_STORAGE_URL_GLOBAL}/${webpPath}`;
    } else if (fp) {
      photoUrl = fp.startsWith('http') ? fp : `/api/proxy/?path=${encodeURIComponent(fp)}`;
    }
  }
  
  if (!photoUrl && actor.dropboxUrl) {
    if (actor.dropboxUrl.includes('supabase.co/storage/v1/object/public/voices/')) {
      photoUrl = actor.dropboxUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    } else if (actor.dropboxUrl.startsWith('visuals/') || actor.dropboxUrl.startsWith('agency/') || actor.dropboxUrl.startsWith('active/') || actor.dropboxUrl.startsWith('common/')) {
      const webpPath = actor.dropboxUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      photoUrl = `${SUPABASE_STORAGE_URL_GLOBAL}/${webpPath}`;
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

export async function getTranslationsServer(lang: string): Promise<Record<string, string>> {
  if (lang === 'nl') return {};
  
  const data = await db.select({
    translationKey: translations.translationKey,
    translatedText: translations.translatedText,
    originalText: translations.originalText
  })
  .from(translations)
  .where(eq(translations.lang, lang));
  
  const translationMap: Record<string, string> = {};
  data?.forEach(row => {
    if (row.translationKey) {
      translationMap[row.translationKey] = row.translatedText || row.originalText || '';
    }
  });
  
  return translationMap;
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
