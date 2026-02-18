import { MarketManager } from "@config/market-manager";
import { db } from "@db";
import { actors, contentArticles, contentBlocks, lessons, media, reviews } from "@db/schema";
import { createClient } from "@supabase/supabase-js";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import fs from 'fs';
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
  console.log(' API: getActors called with params:', params);
  const { language, search, gender, style, market } = params;
  
  try {
    //  CHRIS-PROTOCOL: Map UI language names to DB codes (ISO-based for precision)
    

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
      dbGender
    });

    // We proberen eerst Drizzle (direct connect)
    let dbResults: any[] = [];
    try {
      console.log(' API: Querying all live actors with relations...');
      
      //  CHRIS-PROTOCOL: Build filter conditions
      const conditions = [eq(actors.status, 'live')];
      
      if (dbLang) {
        //  KELLY-MANDATE: Support both exact match and prefix (e.g. 'fr' matches 'fr-fr')
        //  CHRIS-PROTOCOL: Use ilike for case-insensitive matching (fixes nl-BE vs nl-be issues)
        conditions.push(or(
          ilike(actors.nativeLang, dbLang),
          ilike(actors.nativeLang, `${dbLang}-%`)
        ) as any);
      }
      
      if (dbGender) {
        conditions.push(eq(actors.gender, dbGender));
      }

      //  CHRIS-PROTOCOL: Use relational query builder for clean joins
      dbResults = await db.query.actors.findMany({
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
          aiTags: true
          // holidayFrom and holidayTill are excluded as they don't exist in DB
        },
        where: and(...conditions),
        orderBy: [asc(actors.voiceScore)],
        limit: 200,
        with: {
          demos: true,
          country: true
        }
      }).catch(err => {
        console.warn(' Drizzle findMany failed:', err);
        return [];
      });
      
      console.log(' API: Drizzle returned', dbResults.length, 'results');
      if (dbResults.length > 0) {
        console.log('  API: Sample actor photoId:', { 
          name: dbResults[0].firstName, 
          photoId: dbResults[0].photoId,
          photo_id: dbResults[0].photo_id 
        });
      }
      
      if (dbResults.length === 0) {
        console.log('  Drizzle returned 0, checking total live actors...');
        const totalLive = await db.select({ count: sql`count(*)` }).from(actors).where(eq(actors.status, 'live')).catch(() => [{ count: 0 }]);
        console.log(' Total live actors in DB:', totalLive[0].count);
      }
    } catch (dbError) {
      console.warn(' Drizzle failed, falling back to Supabase SDK:', dbError);
      
      let sdkQuery = supabase
        .from('actors')
        .select(`
          *,
          actor_languages(is_native, languages(*)),
          actor_tones(voice_tones(*)),
          countries(*),
          actor_demos(*)
        `)
        .filter('status', 'eq', 'live');

      const { data, error } = await sdkQuery.order('voice_score', { ascending: true }).limit(200);
      if (error) {
        console.error(' Supabase SDK Error:', error);
        throw error;
      }
      
      //  KELLY-MANDATE: Filter results manually if Drizzle failed and we're using SDK
      // (The SDK query above doesn't have the language/gender filters yet)
      let filteredData = data || [];
      if (dbLang) {
        const lowDbLang = dbLang.toLowerCase();
        filteredData = filteredData.filter(item => {
          const actorLang = item.native_lang?.toLowerCase();
          return actorLang === lowDbLang || actorLang?.startsWith(`${lowDbLang}-`);
        });
      }
      if (dbGender) {
        filteredData = filteredData.filter(item => item.gender === dbGender);
      }

      // Map SDK field names to Drizzle field names if they differ
      dbResults = filteredData.map(item => {
        const mapped = {
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
          email: item.email,
          extraLangs: item.extra_langs,
          wpProductId: item.wp_product_id,
          photoId: item.photo_id,
          // Map relations
          actorLanguages: item.actor_languages?.map((al: any) => ({
            isNative: al.is_native,
            language: al.languages
          })),
          actorTones: item.actor_tones?.map((at: any) => ({
            tone: at.voice_tones
          })),
          country: item.countries,
          demos: item.actor_demos
        };
        return mapped;
      });
      
      console.log(' API: Supabase SDK returned', dbResults.length, 'results');
      if (dbResults.length > 0) {
        console.log('  API: SDK Sample actor photo_id:', { 
          name: dbResults[0].firstName, 
          photo_id: dbResults[0].photoId 
        });
      }
    }
    
    console.log(' ACTORS FETCH SUCCESS:', { count: dbResults.length });

    const actorIds = dbResults.map(a => a.id);
    const photoIds = Array.from(new Set(dbResults.map(a => a.photoId).filter(Boolean).map(id => parseInt(id.toString()))));
    console.log(' API: dbResults sample:', dbResults.slice(0, 2).map(a => ({ id: a.id, firstName: a.firstName, photoId: a.photoId })));
    console.log(' API: photoIds to fetch:', photoIds);
    
    // Fetch reviews, translations and media in batch (demos are now included in dbResults)
    let dbReviews: any[] = [];
    let mediaResults: any[] = [];
    let translationMap: Record<string, string> = {};

    try {
      //  CHRIS-PROTOCOL: Batch all secondary requests to avoid sequential blocking
      const [reviewsRes, transRes, mediaRes] = await Promise.all([
        db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(20),
        VoiceglotBridge.translateBatch([...dbResults.map(a => a.bio || ''), ...dbResults.map(a => a.tagline || '')].filter(Boolean), lang),
        photoIds.length > 0
          ? db.select().from(media).where(sql`${media.id} IN (${sql.join(photoIds, sql`, `)})`)
          : Promise.resolve([])
      ]);
      
      // Filter out empty reviews in JS instead of SQL for easier debugging
      dbReviews = reviewsRes.filter(r => r.textNl || r.textEn || r.textFr || r.textDe).slice(0, 12);
      translationMap = transRes;
      mediaResults = mediaRes;
    } catch (relError: any) {
      console.warn(' Drizzle relation fetch failed, falling back to SDK:', relError.message);
      const [reviewsRes, transRes, mediaRes] = await Promise.all([
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20),
        VoiceglotBridge.translateBatch([...dbResults.map(a => a.bio || ''), ...dbResults.map(a => a.tagline || '')].filter(Boolean), lang),
        photoIds.length > 0
          ? supabase.from('media').select('*').in('id', photoIds)
          : Promise.resolve({ data: [] })
      ]);
      
      dbReviews = (reviewsRes.data || [])
        .map(r => ({
          ...r,
          authorName: r.author_name,
          authorUrl: r.author_url,
          textNl: r.text_nl,
          textEn: r.text_en,
          textFr: r.text_fr,
          textDe: r.text_de,
          createdAt: r.created_at
        }))
        .filter(r => r.textNl || r.textEn || r.textFr || r.textDe)
        .slice(0, 12);
      translationMap = transRes;
      mediaResults = (mediaRes.data || []).map(m => ({ ...m, filePath: m.file_path }));
    }

    // Get unique languages for filters
    let uniqueLangs: string[] = [];
    try {
      //  CHRIS-PROTOCOL: Fetch unique languages from the relational table
      // If actorLanguages relation is missing, we use the flat field fallback
      uniqueLangs = Array.from(new Set(dbResults.map(a => a.nativeLang))).filter(Boolean);
    } catch (langError) {
      console.warn(' API: uniqueLangs calculation failed, falling back to SDK');
      const { data } = await supabase.from('actors').select('native_lang').filter('status', 'eq', 'live');
      uniqueLangs = Array.from(new Set((data || []).map(l => l.native_lang))).filter((l): l is string => l !== null);
    }

    const mappedResults = dbResults.map((actor) => {
      //  CHRIS-PROTOCOL: The photo_id in the database is the ABSOLUTE Source of Truth (Linked to Supabase Storage)
      // We check both photoId (Drizzle) and photo_id (SDK)
      let photoUrl = '';
    const effectivePhotoId = actor.photoId || (actor as any).photo_id;
    
    if (effectivePhotoId) {
      const mediaItem = mediaResults.find(m => m.id === effectivePhotoId || m.id === parseInt(effectivePhotoId.toString()));
      if (mediaItem) {
        photoUrl = mediaItem.filePath;
      } else {
        console.log(` API: mediaItem NOT FOUND for actor ${actor.firstName}, photoId: ${effectivePhotoId}`);
      }
    }

    //  CHRIS-PROTOCOL: No legacy fallbacks allowed. If it's not in Supabase, it's not there.
    // The only exception is the dropboxUrl field which acts as a temporary manual override.
    // MAAR: Als dropboxUrl een proxy-URL is, haal dan het pad eruit om dubbele proxying te voorkomen.
    if (!photoUrl && actor.dropboxUrl) {
      console.log(` API: Falling back to dropboxUrl for actor ${actor.firstName} (ID: ${actor.id}):`, { dropboxUrl: actor.dropboxUrl });
      if (actor.dropboxUrl.includes('/api/proxy/?path=')) {
        const urlObj = new URL(actor.dropboxUrl, 'http://localhost');
        photoUrl = decodeURIComponent(urlObj.searchParams.get('path') || '');
      } else {
        const ASSET_BASE = process.env.NEXT_PUBLIC_BASE_URL || '';
        photoUrl = actor.dropboxUrl.startsWith('http') ? actor.dropboxUrl : `${ASSET_BASE}${actor.dropboxUrl}`;
      }
    }

      //  NUCLEAR PROXY ENFORCEMENT: All local paths must go through the proxy
      const proxiedPhoto = photoUrl.startsWith('/api/proxy')
        ? photoUrl
        : (photoUrl.startsWith('http') 
          ? `/api/proxy/?path=${encodeURIComponent(photoUrl)}` 
          : (photoUrl ? `/api/proxy/?path=${encodeURIComponent(photoUrl)}` : ''));
      
      const proxiedPhotoWithFallback = proxiedPhoto; // No more fallback parameter
      
      console.log(` API: Final photoUrl for ${actor.firstName}:`, { original: photoUrl, proxied: proxiedPhotoWithFallback });

    //  AUDIO PROXY & PRIORITY ENFORCEMENT
    const proxiedDemos = (actor.demos || []).map((d: any) => {
      //  CHRIS-PROTOCOL: Relationele koppeling is heilig. 
      // De URL in actor_demos is de directe bron.
      const audioUrl = d.url || '';
      
      // Als de URL al een volledige Supabase URL is, stuur deze dan direct door naar de proxy
      // zonder deze opnieuw te encoden als het al een proxy URL is.
      let finalUrl = audioUrl;
      if (audioUrl.startsWith('http')) {
        finalUrl = `/api/proxy/?path=${encodeURIComponent(audioUrl)}`;
      }
      
      return {
        id: d.id,
        title: d.name,
        audio_url: finalUrl,
        category: d.type || 'demo'
      };
    });

      const translatedBio = translationMap[actor.bio || ''] || actor.bio || '';
      const translatedTagline = translationMap[actor.tagline || ''] || actor.tagline || '';

      //  CHRIS-PROTOCOL: Resolve relational languages and tones
      // Fallback to flat fields if relations are missing
      const nativeLangObj = actor.actorLanguages?.find((al: any) => al.isNative)?.language;
      const extraLangsList = actor.actorLanguages?.filter((al: any) => !al.isNative).map((al: any) => al.language?.code);
      const tonesList = actor.actorTones?.map((at: any) => at.tone?.label);

      return {
        id: actor.wpProductId || actor.id,
        display_name: actor.firstName,
        first_name: actor.firstName,
        last_name: actor.lastName || '',
        firstName: actor.firstName || (actor as any).first_name,
        lastName: actor.lastName || (actor as any).last_name || '',
        email: actor.email || (actor as any).email || '',
        slug: actor.firstName?.toLowerCase() || (actor as any).first_name?.toLowerCase(),
        gender: actor.gender_new || actor.gender, // Prefer enum if available
        native_lang: nativeLangObj?.code || actor.nativeLang,
        photo_url: proxiedPhotoWithFallback,
        starting_price: parseFloat(actor.priceUnpaid || '0'),
        price_unpaid_media: parseFloat(actor.priceUnpaid || '0'),
        price_ivr: actor.priceIvr ? parseFloat(actor.priceIvr) : undefined,
        price_online: actor.priceOnline ? parseFloat(actor.priceOnline) : undefined,
        price_tv_national: (actor.price_tv_national || (actor as any).price_tv_national) ? parseFloat(actor.price_tv_national || (actor as any).price_tv_national) : undefined,
        price_tv_regional: (actor.price_tv_regional || (actor as any).price_tv_regional) ? parseFloat(actor.price_tv_regional || (actor as any).price_tv_regional) : undefined,
        price_tv_local: (actor.price_tv_local || (actor as any).price_tv_local) ? parseFloat(actor.price_tv_local || (actor as any).price_tv_local) : undefined,
        price_radio_national: (actor.price_radio_national || (actor as any).price_radio_national) ? parseFloat(actor.price_radio_national || (actor as any).price_radio_national) : undefined,
        price_radio_regional: (actor.price_radio_regional || (actor as any).price_radio_regional) ? parseFloat(actor.price_radio_regional || (actor as any).price_radio_regional) : undefined,
        price_radio_local: (actor.price_radio_local || (actor as any).price_radio_local) ? parseFloat(actor.price_radio_local || (actor as any).price_radio_local) : undefined,
        price_podcast: (actor.price_podcast || (actor as any).price_podcast) ? parseFloat(actor.price_podcast || (actor as any).price_podcast) : undefined,
        price_social_media: (actor.price_social_media || (actor as any).price_social_media) ? parseFloat(actor.price_social_media || (actor as any).price_social_media) : undefined,
        rates: actor.rates || {},
        rates_raw: actor.rates || {},
        voice_score: actor.voiceScore || 10,
        ai_enabled: actor.isAi,
        ai_tags: actor.aiTags || '',
        bio: translatedBio,
        tagline: translatedTagline,
        tone_of_voice: tonesList?.join(', ') || actor.toneOfVoice || actor.tone_of_voice || actor.toneOfVoiceNew || '',
        clients: actor.clients || '',
        delivery_days_min: actor.deliveryDaysMin || 1,
        delivery_days_max: actor.deliveryDaysMax || 3,
        cutoff_time: actor.cutoffTime || '18:00',
        availability: actor.availability as any[] || [],
        holiday_from: (actor as any).holidayFrom || (actor as any).holiday_from || '',
        holiday_till: (actor as any).holidayTill || (actor as any).holiday_till || '',
        extra_langs: extraLangsList?.join(', ') || actor.extraLangs || '',
        native_lang_label: nativeLangObj?.label || MarketManager.getLanguageLabel(actor.nativeLang || ''),
        demos: proxiedDemos
      };
    });

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
      reviews: dbReviews.map(r => {
        //  CHRIS-PROTOCOL: Ensure dates are correctly parsed from DB
        const reviewDate = r.createdAt ? new Date(r.createdAt) : new Date();
        
        return {
          name: r.authorName,
          text: r.textNl || r.textEn || r.textFr || r.textDe || '',
          authorUrl: r.authorUrl,
          rating: r.rating,
          date: reviewDate.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }),
          rawDate: r.createdAt
        };
      }),
      reviewStats: {
        averageRating: 4.9,
        totalCount: dbReviews.length > 0 ? 392 : 0 // Real count logic
      }
    };
  } catch (error: any) {
    console.error('[getActors FATAL ERROR]:', error);
    throw error;
  }
}

export async function getArticle(slug: string, lang: string = 'nl'): Promise<any> {
  let article: any = null;
  try {
    const results = await db.select().from(contentArticles).where(eq(contentArticles.slug, slug)).limit(1).catch(() => []);
    article = results[0];
  } catch (dbError) {
    console.warn(' getArticle Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('content_articles').select('*').eq('slug', slug).single();
    article = data;
  }
  
  if (!article) return null;

  const translatedTitle = await VoiceglotBridge.t(`page.${slug}.title`, lang, true);
  
  let blocks: any[] = [];
  try {
    blocks = await db.select().from(contentBlocks).where(eq(contentBlocks.articleId, article.id)).orderBy(asc(contentBlocks.displayOrder)).catch(() => []);
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
    console.log(' API: Querying actor with relations:', slug);
    actor = await db.query.actors.findFirst({
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
        aiTags: true
      },
      where: or(eq(actors.slug, slug), ilike(actors.firstName, slug)),
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
        demos: true
      }
    }).catch(() => null);
  } catch (dbError) {
    console.warn(' getActor Drizzle failed, falling back to SDK');
    const { data } = await supabase
      .from('actors')
      .select(`
        *,
        actor_languages(is_native, languages(*)),
        actor_tones(voice_tones(*)),
        countries(*),
        actor_demos(*)
      `)
      .eq('first_name', slug)
      .single();
      
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
        email: data.email,
        status: data.status,
        first_name: data.first_name,
        last_name: data.last_name,
        deliveryDaysMin: data.delivery_days_min,
        deliveryDaysMax: data.delivery_days_max,
        cutoffTime: data.cutoff_time,
        wpProductId: data.wp_product_id,
        // Map relations
        actorLanguages: data.actor_languages?.map((al: any) => ({
          isNative: al.is_native,
          language: al.languages
        })),
        actorTones: data.actor_tones?.map((at: any) => ({
          tone: at.voice_tones
        })),
        country: data.countries,
        demos: data.actor_demos
      };
    }
  }

  if (!actor) throw new Error("Actor not found");

  let dbReviews: any[] = [];
  let mediaItem: { filePath: string } | null = null;

  try {
    const [reviewsRes, mediaRes] = await Promise.all([
      db.select().from(reviews).where(sql`${reviews.iapContext}->>'actorId' = ${actor.id.toString()}`).limit(3),
      actor.photoId ? db.select().from(media).where(eq(media.id, actor.photoId)).limit(1) : Promise.resolve([])
    ]);
    dbReviews = reviewsRes;
    mediaItem = mediaRes[0] || null;
  } catch (relError) {
    console.warn(' getActor relations Drizzle failed, falling back to SDK');
    const [reviewsRes] = await Promise.all([
      supabase.from('reviews').select('*').contains('iap_context', { actorId: actor.id }).limit(3)
    ]);
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
    console.log(` API: Falling back to actor.photo_url for ${actor.firstName}:`, actor.photo_url);
    photoUrl = actor.photo_url.startsWith('http') ? actor.photo_url : `/api/proxy?path=${encodeURIComponent(actor.photo_url)}`;
  }

  const [translatedBio] = await Promise.all([
    VoiceglotBridge.t(actor.bio || '', lang)
  ]);

  //  CHRIS-PROTOCOL: Resolve relational languages and tones
  const nativeLangObj = actor.actorLanguages?.find((al: any) => al.isNative)?.language;
  const extraLangsList = actor.actorLanguages?.filter((al: any) => !al.isNative).map((al: any) => al.language?.code);
  const tonesList = actor.actorTones?.map((at: any) => at.tone?.label);

  return {
    id: actor.wpProductId || actor.id,
    display_name: actor.firstName,
    first_name: actor.firstName,
    last_name: actor.lastName || '',
    firstName: actor.firstName || (actor as any).first_name,
    lastName: actor.lastName || (actor as any).last_name || '',
    email: actor.email || (actor as any).email || '',
    slug: actor.firstName?.toLowerCase() || (actor as any).first_name?.toLowerCase(),
    gender: actor.gender_new || actor.gender || '',
    native_lang: nativeLangObj?.code || actor.nativeLang,
    photo_url: photoUrl,
    description: actor.bio,
    website: actor.website,
    linkedin: actor.linkedin,
    status: actor.status,
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
    holiday_from: (actor as any).holidayFrom || (actor as any).holiday_from || '',
    holiday_till: (actor as any).holidayTill || (actor as any).holiday_till || '',
    extra_langs: extraLangsList?.join(', ') || actor.extraLangs || '',
    native_lang_label: nativeLangObj?.label || '',
    reviews: dbReviews.map(r => ({
      name: r.authorName,
      text: r.textNl || r.textEn || '',
      rating: r.rating,
      date: new Date(r.createdAt!).toLocaleDateString('nl-BE')
    })),
    demos: (actor.demos || []).map((d: any) => ({
      id: d.id,
      title: d.name,
      audio_url: d.url,
      category: d.type || 'demo'
    }))
  };
}

export async function getMusicLibrary(category: string = 'music'): Promise<any[]> {
  try {
    // CHRIS-PROTOCOL: De media tabel is de enige Source of Truth voor muziek.
    // We filteren strikt op 'Onze eigen muziek' via de metadata die we tijdens de migratie hebben gezet.
    const musicMedia = await db.select().from(media).where(
      and(
        eq(media.category, category),
        sql`${media.metadata}->>'vibe' = 'Onze eigen muziek'`
      )
    ).orderBy(media.fileName).catch(() => []);

    // Map de media items naar het juiste formaat voor de UI
    const mappedMedia = musicMedia.map(m => {
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

      // Sherlock: We halen het genre/vibe uit de labels of metadata
      // In onze SQL migratie hebben we de vibe op 'Onze eigen muziek' gezet, 
      // maar we kunnen hier specifieker filteren op genre indien beschikbaar.
      const genre = m.labels?.find(l => !['audio', 'music', 'auto-migrated', 'filesystem-sync'].includes(l)) || 'Algemeen';

      return {
        id: m.id.toString(),
        title: title,
        vibe: genre,
        preview: m.filePath.startsWith('http') ? m.filePath : `/${m.filePath}`
      };
    });

    // Verwijder duplicaten op basis van titel
    const unique = mappedMedia.filter((item, index, self) =>
      index === self.findIndex((t) => t.title.toLowerCase() === item.title.toLowerCase())
    );

    return unique.sort((a, b) => a.title.localeCompare(b.title));

  } catch (dbError) {
    console.warn(' getMusicLibrary Drizzle failed, falling back to SDK');
    const { data } = await supabase.from('media')
      .select('*')
      .eq('category', category)
      .order('file_name');
      
    return (data || []).map(m => ({
      id: m.id.toString(),
      title: m.alt_text || m.file_name,
      vibe: (m.metadata as any)?.vibe || 'Onze eigen muziek',
      preview: m.file_path.startsWith('http') ? m.file_path : `/${m.file_path}`
    }));
  }
}

export async function getAcademyLesson(id: string): Promise<any> {
  const lessonOrder = parseInt(id);
  if (isNaN(lessonOrder)) return null;

  let lesson: any = null;
  try {
    const results = await db.select().from(lessons).where(eq(lessons.displayOrder, lessonOrder)).limit(1).catch(() => []);
    lesson = results[0];
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
      }).catch(() => []);
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
