import { db } from "@db";
import { actorDemos, actors, contentArticles, contentBlocks, lessons, media, reviews } from "@db/schema";
import { createClient } from "@supabase/supabase-js";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import {
    Actor,
    SearchResults,
} from "../types";
import { VoiceglotBridge } from "./voiceglot-bridge";

const readFile = promisify(fs.readFile);

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
 */

export async function getActors(params: Record<string, string> = {}, lang: string = 'nl'): Promise<SearchResults> {
  const { language, search, gender, style, market } = params;
  
  try {
    //  CHRIS-PROTOCOL: Map UI language names to DB codes (ISO-based for precision)
    

const langMap: Record<string, string> = {
  'Vlaams': 'nl-BE',
  'Nederlands': 'nl-NL',
  'Frans': 'fr-FR',
  'Frans (BE)': 'fr-BE',
  'Frans (FR)': 'fr-FR',
  'Engels': 'en-GB',
  'Engels (UK)': 'en-GB',
  'Engels (US)': 'en-US',
  'Duits': 'de-DE',
  'Spaans': 'es-ES',
  'Italiaans': 'it-IT',
  'Pools': 'pl-PL',
  'Deens': 'da-DK',
  'Portugees': 'pt-PT',
  'nl-BE': 'nl-BE',
  'nl-NL': 'nl-NL',
  'fr-BE': 'fr-BE',
  'fr-FR': 'fr-FR',
  'en-GB': 'en-GB',
  'en-US': 'en-US',
  'de-DE': 'de-DE',
  'es-ES': 'es-ES',
  'it-IT': 'it-IT',
  'pl-PL': 'pl-PL',
  'da-DK': 'da-DK',
  'pt-PT': 'pt-PT',
  'nl': 'nl-BE',
  'en': 'en-GB',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES',
  'it': 'it-IT',
  'pl': 'pl-PL',
  'da': 'da-DK',
  'pt': 'pt-PT'
};



    //  CHRIS-PROTOCOL: Map UI gender names to DB codes
    const genderMap: Record<string, string> = {
      'mannelijke stem': 'male',
      'vrouwelijke stem': 'female',
      'mannelijk': 'male',
      'vrouwelijk': 'female',
      'man': 'male',
      'vrouw': 'female'
    };

    const lowLang = language?.toLowerCase() || '';
    const dbLang = language ? (langMap[lowLang] || language) : null;
    const lowGender = gender?.toLowerCase() || '';
    const dbGender = gender ? (genderMap[lowGender] || (lowGender.includes('mannelijk') ? 'male' : lowGender.includes('vrouwelijk') ? 'female' : gender)) : null;
    
    // 🛡️ CHRIS-PROTOCOL: Debug log in terminal (server-side)
    console.log('🎙️ API: getActors internal params:', { 
      language, 
      dbLang, 
      market,
      search,
      gender,
      dbGender
    });

    // We proberen eerst Drizzle (direct connect)
    let dbResults: any[] = [];
    try {
      console.log(' API: Querying with dbLang:', dbLang, 'dbGender:', dbGender);
      let query = db.select().from(actors).$dynamic();
      const conditions: any[] = [eq(actors.status, 'live')];

      // 🛡️ CHRIS-PROTOCOL: Market filtering should only apply if no specific language is selected,
      // to avoid intersection issues where a market might exclude a valid language choice.
      if (!language) {
        if (market === 'FR') conditions.push(or(eq(actors.nativeLang, 'fr-FR'), eq(actors.nativeLang, 'fr-BE')));
        else if (market === 'DE') conditions.push(eq(actors.nativeLang, 'de-DE'));
        else if (market === 'NL') conditions.push(eq(actors.nativeLang, 'nl-NL'));
        else if (market === 'BE') conditions.push(or(eq(actors.nativeLang, 'nl-BE'), eq(actors.nativeLang, 'fr-BE')));
      }

      if (search) {
        conditions.push(or(
          sql`LOWER(${actors.firstName}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${actors.lastName}) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${actors.aiTags}::text) LIKE ${`%${search.toLowerCase()}%`}`,
          sql`LOWER(${actors.bio}) LIKE ${`%${search.toLowerCase()}%`}`
        ));
      }
      if (dbLang) {
        //  CHRIS-PROTOCOL: Support both exact code and loose name matching
        // Met de nieuwe nl-BE / nl-NL structuur is dit veel eenvoudiger.
        conditions.push(or(
          eq(actors.nativeLang, dbLang),
          sql`LOWER(${actors.nativeLang}) LIKE ${`%${lowLang}%`}`,
          sql`LOWER(${actors.bio}) LIKE ${`%${lowLang}%`}`,
          sql`LOWER(${actors.tagline}) LIKE ${`%${lowLang}%`}`
        ));
      }
      if (dbGender) {
        conditions.push(or(
          eq(actors.gender, dbGender),
          sql`LOWER(${actors.gender}) = ${lowGender}`,
          sql`LOWER(${actors.gender}) = ${dbGender}`
        ));
      }

      console.log(' API: Executing Drizzle query...');
      dbResults = await query
        .where(and(...conditions))
        .orderBy(asc(actors.voiceScore))
        .limit(50);
      
      console.log(' API: Drizzle returned', dbResults.length, 'results');
      
      if (dbResults.length === 0) {
        console.log(' ⚠️ Drizzle returned 0, checking total live actors...');
        const totalLive = await db.select({ count: sql`count(*)` }).from(actors).where(eq(actors.status, 'live'));
        console.log(' Total live actors in DB:', totalLive[0].count);
        
        // Let's try a very broad query to see what's in there
        const sample = await db.select({ id: actors.id, name: actors.firstName, lang: actors.nativeLang, status: actors.status }).from(actors).limit(5);
        console.log(' Sample actors in DB:', sample);
      }
    } catch (dbError) {
      console.warn(' Drizzle failed, falling back to Supabase SDK:', dbError);
      
      let sdkQuery = supabase
        .from('actors')
        .select('*')
        .eq('status', 'live');

      if (!language) {
        if (market === 'FR') sdkQuery = sdkQuery.or('native_lang.eq.fr-FR,native_lang.eq.fr-BE');
        else if (market === 'DE') sdkQuery = sdkQuery.eq('native_lang', 'de-DE');
        else if (market === 'NL') sdkQuery = sdkQuery.eq('native_lang', 'nl-NL');
        else if (market === 'BE') sdkQuery = sdkQuery.or('native_lang.eq.nl-BE,native_lang.eq.fr-BE');
      }
      
      if (dbLang) {
        sdkQuery = sdkQuery.or(`native_lang.eq.${dbLang},native_lang.ilike.%${language}%,bio.ilike.%${language}%,tagline.ilike.%${language}%`);
      }
      if (dbGender) {
        sdkQuery = sdkQuery.or(`gender.eq.${dbGender},gender.ilike.${gender}`);
      }
      if (search) sdkQuery = sdkQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,ai_tags.ilike.%${search}%,bio.ilike.%${search}%`);

      const { data, error } = await sdkQuery.order('voice_score', { ascending: true }).limit(50);
      if (error) {
        console.error(' Supabase SDK Error:', error);
        throw error;
      }
      dbResults = data || [];
      
      console.log(' API: Supabase SDK returned', dbResults.length, 'results');

      // Map SDK field names to Drizzle field names if they differ
      dbResults = dbResults.map(item => ({
        ...item,
        firstName: item.first_name,
        lastName: item.last_name,
        nativeLang: item.native_lang,
        voiceScore: item.voice_score,
        dropboxUrl: item.dropbox_url,
        priceUnpaid: item.price_unpaid,
        priceIvr: item.price_ivr,
        priceOnline: item.price_online,
        isAi: item.is_ai,
        aiTags: item.ai_tags,
        deliveryDaysMin: item.delivery_days_min,
        deliveryDaysMax: item.delivery_days_max,
        cutoffTime: item.cutoff_time,
        toneOfVoice: item.tone_of_voice,
        clients: item.clients,
        wpProductId: item.wp_product_id
      }));
    }
    
    console.log(' ACTORS FETCH SUCCESS:', { count: dbResults.length });

    const actorIds = dbResults.map(a => a.id);
    const photoIds = dbResults.map(a => a.photoId).filter(Boolean);
    
    // Fetch demos, reviews, translations and media in batch
    let demos: any[] = [];
    let dbReviews: any[] = [];
    let mediaResults: any[] = [];
    let translationMap: Record<string, string> = {};
    let photoManifest: any = { voices: {} };

    try {
      //  MOBY: Load photo manifest to match images correctly
      try {
        const manifestPath = path.join(process.cwd(), 'public/assets/visuals/photo-manifest.json');
        const manifestData = await readFile(manifestPath, 'utf8');
        photoManifest = JSON.parse(manifestData);
      } catch (e) {
        console.warn(' Could not load photo-manifest.json');
      }

      const [demosRes, reviewsRes, transRes, mediaRes] = await Promise.all([
        actorIds.length > 0 
          ? db.select().from(actorDemos).where(sql`${actorDemos.actorId} IN (${sql.join(actorIds, sql`, `)})`)
          : Promise.resolve([]),
        db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(10),
        VoiceglotBridge.translateBatch([...dbResults.map(a => a.bio || ''), ...dbResults.map(a => a.tagline || '')].filter(Boolean), lang),
        photoIds.length > 0
          ? db.select().from(media).where(sql`${media.id} IN (${sql.join(photoIds, sql`, `)})`)
          : Promise.resolve([])
      ]);
      demos = demosRes;
      dbReviews = reviewsRes;
      translationMap = transRes;
      mediaResults = mediaRes;
    } catch (relError) {
      console.warn(' Drizzle relation fetch failed, falling back to SDK');
      const [demosRes, reviewsRes, transRes, mediaRes] = await Promise.all([
        actorIds.length > 0 
          ? supabase.from('actor_demos').select('*').in('actor_id', actorIds)
          : Promise.resolve({ data: [] }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(10),
        VoiceglotBridge.translateBatch([...dbResults.map(a => a.bio || ''), ...dbResults.map(a => a.tagline || '')].filter(Boolean), lang),
        photoIds.length > 0
          ? supabase.from('media').select('*').in('id', photoIds)
          : Promise.resolve({ data: [] })
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
      mediaResults = (mediaRes.data || []).map(m => ({ ...m, filePath: m.file_path }));
    }

    const mappedResults = dbResults.map((actor) => {
      const actorId = actor.wpProductId || actor.id;
      const firstName = actor.firstName?.toLowerCase() || 'voice';
      const fallbackPath = `/assets/visuals/active/voicecards/${actorId}-${firstName}-photo-square-1.jpg`;
      
      let photoUrl = '';

      // 🛡️ CHRIS-PROTOCOL: The photo_id in the database is the ABSOLUTE Source of Truth (Linked to Supabase Storage)
      if (actor.photoId) {
        const mediaItem = mediaResults.find(m => m.id === actor.photoId);
        if (mediaItem) {
          photoUrl = mediaItem.filePath;
        }
      }

      // 🛡️ FALLBACK 1: Match with manifest if no database link exists
      if (!photoUrl) {
        const manifestEntry = photoManifest.voices[actorId.toString()];
        if (manifestEntry) {
          const bestPhoto = 
            manifestEntry.optimised?.find((p: any) => p.file.includes('square-3')) ||
            manifestEntry.portfolio?.find((p: any) => p.file.includes('square-3')) ||
            manifestEntry.optimised?.find((p: any) => p.orientation === 'square') ||
            manifestEntry.portfolio?.find((p: any) => p.orientation === 'square') ||
            manifestEntry.optimised?.[0] ||
            manifestEntry.portfolio?.[0];
          
          if (bestPhoto) {
            photoUrl = bestPhoto.path;
          }
        }
      }

      // 🛡️ FALLBACK 2: Strict naming convention
      if (!photoUrl) {
        photoUrl = fallbackPath;
      }
      
      if (!photoUrl && actor.photo_url) photoUrl = actor.photo_url;
      if (!photoUrl && actor.dropboxUrl) {
        const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';
        photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE}${actor.dropboxUrl}`;
      }

      // 🛡️ NUCLEAR PROXY ENFORCEMENT: All local paths must go through the proxy
      // We use the trailing slash because next.config.mjs has trailingSlash: true
      const proxiedPhoto = photoUrl.startsWith('http') 
        ? photoUrl 
        : (photoUrl ? `/api/proxy/?path=${encodeURIComponent(photoUrl)}` : '');

      // 🛡️ AUDIO PROXY & PRIORITY ENFORCEMENT
      const actorDemos = demos.filter(d => d.actorId === actor.id);
      
      // Separate Supabase demos from legacy demos
      const supabaseDemos = actorDemos.filter(d => d.url.includes('supabase.co'));
      const legacyDemos = actorDemos.filter(d => !d.url.includes('supabase.co'));
      
      // If we have Supabase demos, we prefer them
      const finalDemos = supabaseDemos.length > 0 ? supabaseDemos : legacyDemos;

      const proxiedDemos = finalDemos.map(d => {
        // Supabase URLs are direct and don't need proxying
        if (d.url.includes('supabase.co')) {
          return {
            id: d.id,
            title: d.name,
            audio_url: d.url,
            category: d.type || 'demo'
          };
        }
        
        // Legacy URLs go through the proxy
        return {
          id: d.id,
          title: d.name,
          audio_url: d.url.startsWith('http') ? `/api/proxy/?path=${encodeURIComponent(d.url)}` : d.url,
          category: d.type || 'demo'
        };
      });

      const translatedBio = translationMap[actor.bio || ''] || actor.bio || '';
      const translatedTagline = translationMap[actor.tagline || ''] || actor.tagline || '';

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        last_name: actor.lastName || '',
        slug: actor.firstName.toLowerCase(),
        gender: actor.gender,
        native_lang: (actor.nativeLang as string | undefined) ?? undefined,
        photo_url: proxiedPhoto,
        local_photo_path: fallbackPath,
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        price_unpaid_media: parseFloat(actor.priceUnpaid || '0'),
        price_ivr: parseFloat(actor.priceIvr || '0'),
        price_online: parseFloat(actor.priceOnline || '0'),
        rates_raw: actor.rates || {},
        voice_score: actor.voiceScore || 10,
        ai_enabled: actor.isAi,
        ai_tags: actor.aiTags || '',
        bio: translatedBio,
        tagline: translatedTagline,
        tone_of_voice: actor.toneOfVoice || actor.tone_of_voice || '',
        clients: actor.clients || '',
        delivery_days_min: actor.deliveryDaysMin || 1,
        delivery_days_max: actor.deliveryDaysMax || 3,
        cutoff_time: actor.cutoffTime || '18:00',
        availability: actor.availability as any[] || [],
        extra_langs: actor.extraLangs || '',
        demos: proxiedDemos
      };
    });

    // Get unique languages for filters
    let uniqueLangs: string[] = [];
    try {
      const langs = await db.select({ lang: actors.nativeLang }).from(actors).where(eq(actors.status, 'live')).groupBy(actors.nativeLang);
      uniqueLangs = Array.from(new Set(langs.map(l => l.lang))).filter((l): l is string => l !== null);
    } catch (langError) {
      const { data } = await supabase.from('actors').select('native_lang').eq('status', 'live');
      uniqueLangs = Array.from(new Set((data || []).map(l => l.native_lang))).filter((l): l is string => l !== null);
    }

    //  CHRIS-PROTOCOL: Ensure primary languages are always present and at the top
    const priorityLangs = ['Vlaams', 'Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans', 'Italiaans', 'Pools', 'Portugees', 'Turks', 'Deens', 'Zweeds', 'Noors', 'Fins', 'Grieks', 'Russisch', 'Arabisch', 'Chinees', 'Japans'];
    const otherLangs = uniqueLangs.filter(l => !priorityLangs.includes(l)).sort();
    uniqueLangs = [...priorityLangs.filter(l => uniqueLangs.includes(l)), ...otherLangs];

    return {
      count: mappedResults.length,
      results: mappedResults as any,
      filters: {
        genders: ['Mannelijk', 'Vrouwelijk'],
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
    console.error('[getActors FATAL ERROR]:', error);
    throw error;
  }
}

export async function getArticle(slug: string, lang: string = 'nl'): Promise<any> {
  let article: any = null;
  try {
    [article] = await db.select().from(contentArticles).where(eq(contentArticles.slug, slug)).limit(1);
  } catch (dbError) {
    console.warn(' getArticle Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('content_articles').select('*').eq('slug', slug).single();
    article = data;
  }
  
  if (!article) return null;

  const translatedTitle = await VoiceglotBridge.t(`page.${slug}.title`, lang, true);
  
  let blocks: any[] = [];
  try {
    blocks = await db.select().from(contentBlocks).where(eq(contentBlocks.articleId, article.id)).orderBy(asc(contentBlocks.displayOrder));
  } catch (blockError) {
    console.warn(' getArticle blocks Drizzle failed, falling back to SDK');
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
    console.warn(' getActor Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('actors').select('*').eq('first_name', slug).single();
    if (data) {
      actor = {
        ...data,
        firstName: data.first_name,
        lastName: data.last_name,
        nativeLang: data.native_lang,
        voiceScore: data.voice_score,
        dropboxUrl: data.dropbox_url,
        photoId: data.photo_id,
        priceUnpaid: data.price_unpaid,
        priceIvr: data.price_ivr,
        priceOnline: data.price_online,
        isAi: data.is_ai,
        aiTags: data.ai_tags,
        website: data.website,
        linkedin: data.linkedin,
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
  let mediaItem: { filePath: string } | null = null;

  try {
    const [demosRes, reviewsRes, mediaRes] = await Promise.all([
      db.select().from(actorDemos).where(eq(actorDemos.actorId, actor.id)),
      db.select().from(reviews).where(sql`${reviews.iapContext}->>'actorId' = ${actor.id.toString()}`).limit(3),
      actor.photoId ? db.select().from(media).where(eq(media.id, actor.photoId)).limit(1) : Promise.resolve([])
    ]);
    demos = demosRes;
    dbReviews = reviewsRes;
    mediaItem = mediaRes[0] || null;
  } catch (relError) {
    console.warn(' getActor relations Drizzle failed, falling back to SDK');
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
    if (actor.photoId) {
      const { data: m } = await supabase.from('media').select('file_path').eq('id', actor.photoId).single();
      if (m) mediaItem = { filePath: m.file_path };
    }
  }

  //  LOUIS: photoId (Supabase Storage) prioritized over dropboxUrl/legacy URLs
  const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';
  let photoUrl = '';
  if (actor.photoId && mediaItem) {
    const fp = mediaItem.filePath;
    photoUrl = fp.startsWith('http') ? fp : (fp ? `/api/proxy?path=${encodeURIComponent(fp)}` : '');
  }
  if (!photoUrl && actor.dropboxUrl) {
    photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE}${actor.dropboxUrl}`;
  }
  if (!photoUrl && actor.photo_url) {
    photoUrl = actor.photo_url.startsWith('http') ? actor.photo_url : `/api/proxy?path=${encodeURIComponent(actor.photo_url)}`;
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
    photo_url: photoUrl,
    description: actor.bio,
    website: actor.website,
    linkedin: actor.linkedin,
    starting_price: parseFloat(actor.priceUnpaid || '0'),
    price_ivr: parseFloat(actor.priceIvr || actor.price_ivr || '0'),
    price_online: parseFloat(actor.priceOnline || actor.price_online || '0'),
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
    console.warn(' getMusicLibrary Drizzle failed, falling back to SDK');
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
    console.warn(' getAcademyLesson Drizzle failed, falling back to SDK');
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

export async function getFaqs(category: string, limit: number = 5): Promise<any[]> {
  console.log(' getFaqs called with:', { category, limit });
  let results: any[] = [];
  try {
    //  CHRIS-PROTOCOL: We proberen eerst de SDK direct om Drizzle Proxy issues te vermijden op deze pagina
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('category', category)
      .eq('is_public', true)
      .limit(limit);
    
    if (error) throw error;
    
    results = (data || []).map(f => ({
      ...f,
      id: f.id,
      questionNl: f.question_nl,
      answerNl: f.answer_nl,
      isPublic: f.is_public
    }));
    console.log(' getFaqs SDK success:', { count: results.length });
  } catch (err) {
    console.error(' getFaqs FATAL ERROR:', err);
    return [];
  }
  return results;
}

export async function getWorkshops(limit: number = 50): Promise<any[]> {
  try {
    console.log(' ATTEMPTING DB SELECT FROM workshops');
    
    let workshopsData: any[] = [];
    try {
      workshopsData = await db.query.workshops.findMany({
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
              gte(fields.date, new Date())
            ),
            orderBy: (fields, { asc }) => [asc(fields.date)],
            with: {
              location: true,
              instructor: true
            }
          }
        }
      });
    } catch (dbError) {
      console.warn(' Drizzle failed on getWorkshops, falling back to SDK:', dbError);
      const { data, error } = await supabase
        .from('workshops')
        .select('*, media(*), instructor:instructors(*), editions:workshop_editions(*, location:locations(*), instructor:instructors(*))')
        .not('slug', 'ilike', '%academy%')
        .not('slug', 'ilike', '%op-maat%')
        .not('slug', 'ilike', '%intonatie%')
        .not('slug', 'ilike', '%articulatie%')
        .not('slug', 'ilike', '%verwen-je-stem%')
        .order('date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      workshopsData = (data || []).map(w => ({
        ...w,
        media: w.media,
        instructor: w.instructor,
        editions: (w.editions || [])
          .filter((e: any) => e.status === 'upcoming' && new Date(e.date) >= new Date())
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((e: any) => ({
            ...e,
            location: e.location,
            instructor: e.instructor
          }))
      }));
    }
    
    return workshopsData;
  } catch (error) {
    console.error(' getWorkshops FATAL ERROR:', error);
    return [];
  }
}

export async function getTranslationsServer(lang: string): Promise<Record<string, string>> {
  if (lang === 'nl') return {};
  
  try {
    const { data, error } = await supabase
      .from('translations')
      .select('translation_key, translated_text, original_text')
      .eq('lang', lang);
    
    if (error) throw error;
    
    const translationMap: Record<string, string> = {};
    data?.forEach(row => {
      if (row.translation_key) {
        translationMap[row.translation_key] = row.translated_text || row.original_text || '';
      }
    });
    
    return translationMap;
  } catch (err) {
    console.error(' getTranslationsServer FATAL ERROR:', err);
    return {};
  }
}
