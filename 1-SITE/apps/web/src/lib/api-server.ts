import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@db";
import { actorDemos, actors, contentArticles, contentBlocks, media, reviews, translations, lessons } from "@db/schema";
import { VoiceglotBridge } from "./voiceglot-bridge";
import { 
  Actor, 
  SearchResults, 
} from "../types";

/**
 * 🚀 SERVER-ONLY API (2026)
 * 
 * Bevat alle database-interacties die alleen op de server mogen draaien.
 */

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl'): Promise<SearchResults> {
  const { language, search, gender, style } = params;
  
  try {
    console.log('🔍 ATTEMPTING DB SELECT FROM actors');
    const dbResults = await db.select().from(actors)
      .where(eq(actors.status, 'live'))
      .orderBy(desc(actors.voiceScore))
      .limit(50);
    
    console.log('✅ ACTORS FETCH SUCCESS:', { count: dbResults.length });

    const actorIds = dbResults.map(a => a.id);
    const [demos, dbReviews] = await Promise.all([
      actorIds.length > 0 
        ? db.select().from(actorDemos).where(sql`${actorDemos.actorId} IN (${sql.join(actorIds, sql`, `)})`)
        : Promise.resolve([]),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(10)
    ]);

  const mappedResults = await Promise.all(dbResults.map(async (actor) => {
    const photoUrl = actor.dropboxUrl || '';
    const proxiedPhoto = photoUrl.startsWith('http') 
      ? photoUrl 
      : (photoUrl ? `/api/proxy?path=${encodeURIComponent(photoUrl)}` : '');

    const translatedBio = await VoiceglotBridge.t(actor.bio || '', lang);

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
  }));

  const langs = await db.select({ lang: actors.nativeLang }).from(actors).where(eq(actors.status, 'live')).groupBy(actors.nativeLang);
  const uniqueLangs: string[] = Array.from(new Set(langs.map(l => l.lang))).filter((l): l is string => l !== null).sort();

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
    
    // 🛡️ CHRIS-PROTOCOL: EMERGENCY FALLBACK
    // Als de database ontploft, leveren we een 'Safe Harbor' ervaring.
    // De site mag NOOIT dood aanvoelen.
    return {
      count: 1,
      results: [{
        id: 'fallback-johfrah',
        display_name: 'Johfrah',
        first_name: 'Johfrah',
        last_name: 'Lefebvre',
        slug: 'johfrah',
        gender: 'Mannelijke stem',
        native_lang: 'nl',
        photo_url: '/assets/images/hero-artist-placeholder.jpg',
        starting_price: 0,
        voice_score: 10,
        ai_enabled: false,
        bio: 'Systeem in herstelmodus. Neem contact op voor boekingen.',
        demos: []
      }] as any,
      filters: { genders: [], languages: ['nl'], styles: [] },
      _nuclear: true,
      _source: 'emergency_fallback',
      reviews: []
    };
  }
}

export async function getArticle(slug: string, lang: string = 'nl'): Promise<any> {
  let [article] = await db.select().from(contentArticles).where(eq(contentArticles.slug, slug)).limit(1);
  
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
  const [actor] = await db.select().from(actors).where(eq(actors.firstName, slug)).limit(1);
  if (!actor) throw new Error("Actor not found");

  const [demos, dbReviews] = await Promise.all([
    db.select().from(actorDemos).where(eq(actorDemos.actorId, actor.id)),
    db.select().from(reviews).where(sql`${reviews.iapContext}->>'actorId' = ${actor.id.toString()}`).limit(3)
  ]);
  
  const translatedBio = await VoiceglotBridge.t(actor.bio || '', lang);

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
    delivery_days_min: actor.delivery_days_min || 1,
    delivery_days_max: actor.delivery_days_max || 3,
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
  const results = await db.select().from(media).where(eq(media.category, category)).orderBy(media.fileName);
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

  const [lesson] = await db.select().from(lessons).where(eq(lessons.displayOrder, lessonOrder)).limit(1);
  
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
