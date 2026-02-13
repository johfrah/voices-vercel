import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@db";
import { actorDemos, actors, contentArticles, contentBlocks, media, reviews, translations, lessons } from "@db/schema";
import { VoiceglotBridge } from "./voiceglot-bridge";
import { 
  Actor, 
  SearchResults, 
} from "../types";
import { createClient } from "@supabase/supabase-js";

// 🛡️ CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt (DNS/Pooler issues)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 🚀 SERVER-ONLY API (2026)
 * 
 * Bevat alle database-interacties die alleen op de server mogen draaien.
 */

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl'): Promise<SearchResults> {
  const { language, search, gender, style, market } = params;
  
  try {
    console.log('🔍 ATTEMPTING DB SELECT FROM actors', { params });
    
    // We proberen eerst Drizzle (direct connect)
    let dbResults: any[] = [];
    try {
      let query = db.select().from(actors).$dynamic();
      const conditions = [eq(actors.status, 'live')];

      if (market === 'FR') conditions.push(eq(actors.nativeLang, 'Frans'));
      else if (market === 'DE') conditions.push(eq(actors.nativeLang, 'Duits'));

      if (search) {
        conditions.push(or(
          sql`LOWER(${actors.firstName}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${actors.lastName}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${actors.aiTags}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${actors.bio}) LIKE ${`%${search.toLowerCase()}%`}`
        )!);
      }
      if (language) conditions.push(eq(actors.nativeLang, language));
      if (gender) conditions.push(eq(actors.gender, gender));

      dbResults = await query
        .where(and(...conditions))
        .orderBy(asc(actors.voiceScore))
        .limit(50);
    } catch (dbError) {
      console.warn('⚠️ Drizzle failed, falling back to Supabase SDK:', dbError);
      
      let sdkQuery = supabase
        .from('actors')
        .select('*')
        .eq('status', 'live')
        .order('voice_score', { ascending: true })
        .limit(50);

      if (market === 'FR') sdkQuery = sdkQuery.eq('native_lang', 'Frans');
      else if (market === 'DE') sdkQuery = sdkQuery.eq('native_lang', 'Duits');
      
      if (language) sdkQuery = sdkQuery.eq('native_lang', language);
      if (gender) sdkQuery = sdkQuery.eq('gender', gender);
      if (search) sdkQuery = sdkQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,ai_tags.ilike.%${search}%,bio.ilike.%${search}%`);

      const { data, error } = await sdkQuery;
      if (error) throw error;
      
      // Map SDK field names to Drizzle field names if they differ
      dbResults = data.map(item => ({
        ...item,
        firstName: item.first_name,
        lastName: item.last_name,
        nativeLang: item.native_lang,
        voiceScore: item.voice_score,
        dropboxUrl: item.dropbox_url,
        priceUnpaid: item.price_unpaid,
        priceIvr: item.price_ivr,
        isAi: item.is_ai,
        aiTags: item.ai_tags,
        deliveryDaysMin: item.delivery_days_min,
        deliveryDaysMax: item.delivery_days_max,
        cutoffTime: item.cutoff_time,
        wpProductId: item.wp_product_id
      }));
    }
    
    console.log('✅ ACTORS FETCH SUCCESS:', { count: dbResults.length });

    const actorIds = dbResults.map(a => a.id);
    
    // Fetch demos, reviews and translations in batch
    let demos: any[] = [];
    let dbReviews: any[] = [];
    let translationMap: Record<string, string> = {};

    try {
      const [demosRes, reviewsRes, transRes] = await Promise.all([
        actorIds.length > 0 
          ? db.select().from(actorDemos).where(sql`${actorDemos.actorId} IN (${sql.join(actorIds, sql`, `)})`)
          : Promise.resolve([]),
        db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(10),
        VoiceglotBridge.translateBatch(dbResults.map(a => a.bio || '').filter(Boolean), lang)
      ]);
      demos = demosRes;
      dbReviews = reviewsRes;
      translationMap = transRes;
    } catch (relError) {
      console.warn('⚠️ Drizzle relation fetch failed, falling back to SDK');
      const [demosRes, reviewsRes, transRes] = await Promise.all([
        actorIds.length > 0 
          ? supabase.from('actor_demos').select('*').in('actor_id', actorIds)
          : Promise.resolve({ data: [] }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(10),
        VoiceglotBridge.translateBatch(dbResults.map(a => a.bio || '').filter(Boolean), lang)
      ]);
      
      demos = (demosRes.data || []).map(d => ({ ...d, actorId: d.actor_id }));
      dbReviews = (reviewsRes.data || []).map(r => ({
        ...r,
        authorName: r.author_name,
        textNl: r.text_nl,
        textEn: r.text_en,
        createdAt: r.created_at
      }));
      translationMap = transRes;
    }

    const mappedResults = dbResults.map((actor) => {
      const photoUrl = actor.dropboxUrl || '';
      const proxiedPhoto = photoUrl.startsWith('http') 
        ? photoUrl 
        : (photoUrl ? `/api/proxy?path=${encodeURIComponent(photoUrl)}` : '');

      const translatedBio = translationMap[actor.bio || ''] || actor.bio || '';

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        last_name: actor.lastName || '',
        slug: actor.firstName.toLowerCase(),
        gender: actor.gender,
        native_lang: (actor.nativeLang as string | undefined) ?? undefined,
        photo_url: proxiedPhoto,
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        price_unpaid_media: parseFloat(actor.priceUnpaid || '0'),
        price_ivr: parseFloat(actor.priceIvr || '0'),
        rates_raw: actor.rates || {},
        voice_score: actor.voiceScore || 10,
        ai_enabled: actor.isAi,
        ai_tags: actor.aiTags || '',
        bio: translatedBio,
        delivery_days_min: actor.deliveryDaysMin || 1,
        delivery_days_max: actor.deliveryDaysMax || 3,
        cutoff_time: actor.cutoffTime || '18:00',
        availability: actor.availability as any[] || [],
        demos: demos
          .filter(d => d.actorId === actor.id)
          .map(d => ({
            id: d.id,
            title: d.name,
            audio_url: d.url.startsWith('http') ? d.url : `/api/proxy?path=${encodeURIComponent(d.url)}`,
            category: d.type || 'demo'
          }))
      };
    });

    // Get unique languages for filters
    let uniqueLangs: string[] = [];
    try {
      const langs = await db.select({ lang: actors.nativeLang }).from(actors).where(eq(actors.status, 'live')).groupBy(actors.nativeLang);
      uniqueLangs = Array.from(new Set(langs.map(l => l.lang))).filter((l): l is string => l !== null).sort();
    } catch (langError) {
      const { data } = await supabase.from('actors').select('native_lang').eq('status', 'live');
      uniqueLangs = Array.from(new Set((data || []).map(l => l.native_lang))).filter((l): l is string => l !== null).sort();
    }

    return {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: {
        genders: ['Mannelijke stem', 'Vrouwelijke stem'],
        languages: uniqueLangs,
        styles: ['Corporate', 'Commercial', 'Narrative', 'Energetic', 'Warm']
      },
      _nuclear: true,
      _source: 'supabase',
      reviews: dbReviews.map(r => ({
        name: r.authorName,
        text: r.textNl || r.textEn || '',
        rating: r.rating,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('nl-BE') : ''
      }))
    };
  } catch (error: any) {
    console.error('❌ getActors FATAL ERROR:', error);
    throw error;
  }
}

export async function getArticle(slug: string, lang: string = 'nl'): Promise<any> {
  let article: any = null;
  try {
    [article] = await db.select().from(contentArticles).where(eq(contentArticles.slug, slug)).limit(1);
  } catch (dbError) {
    console.warn('⚠️ getArticle Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('content_articles').select('*').eq('slug', slug).single();
    article = data;
  }
  
  if (!article) return null;

  const translatedTitle = await VoiceglotBridge.t(`page.${slug}.title`, lang, true);
  
  let blocks: any[] = [];
  try {
    blocks = await db.select().from(contentBlocks).where(eq(contentBlocks.articleId, article.id)).orderBy(asc(contentBlocks.displayOrder));
  } catch (blockError) {
    console.warn('⚠️ getArticle blocks Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('content_blocks').select('*').eq('article_id', article.id).order('display_order', { ascending: true });
    blocks = (data || []).map(b => ({ ...b, articleId: b.article_id, displayOrder: b.display_order }));
  }

  return {
    ...article,
    title: translatedTitle,
    blocks: blocks
  };
}

export async function getActor(slug: string, lang: string = 'nl'): Promise<Actor> {
  let actor: any = null;
  try {
    [actor] = await db.select().from(actors).where(eq(actors.firstName, slug)).limit(1);
  } catch (dbError) {
    console.warn('⚠️ getActor Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('actors').select('*').eq('first_name', slug).single();
    if (data) {
      actor = {
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
        nativeLang: data.native_lang,
        voiceScore: data.voice_score,
        dropboxUrl: data.dropbox_url,
        priceUnpaid: data.price_unpaid,
        isAi: data.is_ai,
        aiTags: data.ai_tags,
        deliveryDaysMin: data.delivery_days_min,
        deliveryDaysMax: data.delivery_days_max,
        cutoffTime: data.cutoff_time,
        wpProductId: data.wp_product_id
      };
    }
  }

  if (!actor) throw new Error("Actor not found");

  let demos: any[] = [];
  let dbReviews: any[] = [];

  try {
    [demos, dbReviews] = await Promise.all([
      db.select().from(actorDemos).where(eq(actorDemos.actorId, actor.id)),
      db.select().from(reviews).where(sql`${reviews.iapContext}->>'actorId' = ${actor.id.toString()}`).limit(3)
    ]);
  } catch (relError) {
    console.warn('⚠️ getActor relations Drizzle failed, falling back to SDK');
    const [demosRes, reviewsRes] = await Promise.all([
      supabase.from('actor_demos').select('*').eq('actor_id', actor.id),
      supabase.from('reviews').select('*').contains('iap_context', { actorId: actor.id }).limit(3)
    ]);
    demos = demosRes.data || [];
    dbReviews = (reviewsRes.data || []).map(r => ({
      ...r,
      authorName: r.author_name,
      textNl: r.text_nl,
      textEn: r.text_en,
      createdAt: r.created_at
    }));
  }
  
  const [translatedBio] = await Promise.all([
    VoiceglotBridge.t(actor.bio || '', lang)
  ]);

  return {
    id: actor.wpProductId || actor.id,
    display_name: actor.firstName,
    first_name: actor.firstName,
    last_name: actor.lastName || '',
    slug: actor.firstName.toLowerCase(),
    gender: actor.gender || '',
    native_lang: (actor.nativeLang as string | undefined) ?? undefined,
    photo_url: actor.dropboxUrl || '',
    starting_price: parseFloat(actor.priceUnpaid || '0'),
    voice_score: actor.voiceScore || 10,
    ai_enabled: actor.isAi || false,
    ai_tags: actor.aiTags || '',
    bio: translatedBio,
    price_unpaid: parseFloat(actor.priceUnpaid || '0'),
    delivery_days_min: actor.deliveryDaysMin || 1,
    delivery_days_max: actor.deliveryDaysMax || 2,
    cutoff_time: actor.cutoffTime || '18:00',
    availability: actor.availability as any[] || [],
    reviews: dbReviews.map(r => ({
      name: r.authorName,
      text: r.textNl || r.textEn || '',
      rating: r.rating,
      date: new Date(r.createdAt!).toLocaleDateString('nl-BE')
    })),
    demos: demos.map(d => ({
      id: d.id,
      title: d.name,
      audio_url: d.url,
      category: d.type || 'demo'
    }))
  };
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  let results: any[] = [];
  try {
    results = await db.select().from(media).where(eq(media.category, category)).orderBy(media.fileName);
  } catch (dbError) {
    console.warn('⚠️ getMusicLibrary Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('media').select('*').eq('category', category).order('file_name');
    results = (data || []).map(m => ({
      ...m,
      fileName: m.file_name,
      filePath: m.file_path,
      altText: m.alt_text
    }));
  }

  return results.map(m => ({
    id: m.id.toString(),
    title: m.altText || m.fileName,
    vibe: (m.metadata as any)?.vibe || '',
    preview: m.filePath.startsWith('http') ? m.filePath : `/${m.filePath}`
  }));
}

export async function getAcademyLesson(id: string): Promise<any> {
  const lessonOrder = parseInt(id);
  if (isNaN(lessonOrder)) return null;

  let lesson: any = null;
  try {
    [lesson] = await db.select().from(lessons).where(eq(lessons.displayOrder, lessonOrder)).limit(1);
  } catch (dbError) {
    console.warn('⚠️ getAcademyLesson Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('lessons').select('*').eq('display_order', lessonOrder).single();
    if (data) {
      lesson = {
        ...data,
        displayOrder: data.display_order,
        videoUrl: data.video_url,
        introScript: data.intro_script,
        deepDiveScript: data.deep_dive_script
      };
    }
  }
  
  if (!lesson) return null;

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
}
