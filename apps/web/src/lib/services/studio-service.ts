import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const STORAGE_BASE = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/voices`;

/** Media ID voor Studio hero video (workshop-beginners-aftermovie). Override via env STUDIO_HERO_VIDEO_MEDIA_ID. */
const STUDIO_HERO_VIDEO_MEDIA_ID = process.env.STUDIO_HERO_VIDEO_MEDIA_ID
  ? parseInt(process.env.STUDIO_HERO_VIDEO_MEDIA_ID, 10)
  : null;

function toPublicStorageUrl(filePath?: string | null): string | null {
  if (!filePath) return null;
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const cleanPath = filePath.replace(/^\/+/, '');
  return `${STORAGE_BASE}/${cleanPath}`;
}

function languageLabelFromCode(code?: string | null): string {
  const normalized = (code || '').toLowerCase();
  const labels: Record<string, string> = {
    'nl-be': 'Nederlands',
    'nl-nl': 'Nederlands',
    'fr-fr': 'Frans',
    'en-gb': 'Engels',
    'de-de': 'Duits',
    'es-es': 'Spaans',
    'it-it': 'Italiaans',
  };
  return labels[normalized] || code || 'Nederlands';
}

async function getStudioHeroVideo(): Promise<{ heroVideoPath: string | null; heroVideoMediaId: number | null }> {
  if (!db) return { heroVideoPath: null, heroVideoMediaId: null };
  let heroVideoPath: string | null = null;
  let heroVideoMediaId: number | null = null;
  if (STUDIO_HERO_VIDEO_MEDIA_ID) {
    const heroRow = await db.execute(sql`
      SELECT id, file_path FROM media WHERE id = ${STUDIO_HERO_VIDEO_MEDIA_ID} LIMIT 1
    `);
    const heroData = Array.isArray(heroRow) ? heroRow : (heroRow as any).rows ?? [];
    if (heroData.length > 0 && (heroData[0] as any).file_path) {
      heroVideoPath = (heroData[0] as any).file_path;
      heroVideoMediaId = (heroData[0] as any).id;
    }
  }
  if (!heroVideoPath) {
    const byName = await db.execute(sql`
      SELECT id, file_path FROM media WHERE file_path ILIKE '%workshop-beginners-aftermovie%' LIMIT 1
    `);
    const byNameData = Array.isArray(byName) ? byName : (byName as any).rows ?? [];
    if (byNameData.length > 0 && (byNameData[0] as any).file_path) {
      heroVideoPath = (byNameData[0] as any).file_path;
      heroVideoMediaId = (byNameData[0] as any).id;
    }
  }
  return { heroVideoPath, heroVideoMediaId };
}

async function safeExecuteRows<T = any>(query: any, label: string): Promise<T[]> {
  if (!db) return [];
  try {
    const rows = await db.execute(query);
    return Array.isArray(rows) ? rows as T[] : ((rows as any).rows || []) as T[];
  } catch (error: any) {
    console.warn(`[getStudioWorkshopsData] ${label} failed, using empty fallback:`, error?.message || error);
    return [];
  }
}

export interface WorkshopApiResponse {
  workshops: any[];
  instructors: any[];
  faqs: any[];
  heroVideoPath: string | null;
  heroVideoMediaId: number | null;
  _meta: { count: number; fetched_at: string };
}

/**
 * ☢️ NUCLEAR STUDIO SERVICE (v2.16.103)
 * Absolute Source of Truth voor de Studio World.
 *
 * DATA-EIS: Workshops tonen alleen als:
 * - w.world_id = 2 (Studio World)
 * - w.status IN ('publish', 'live')
 * Geen data? Controleer in Supabase: SELECT id, title, status, world_id FROM workshops WHERE world_id = 2;
 */
export async function getStudioWorkshopsData(): Promise<WorkshopApiResponse> {
  if (!db) throw new Error('Database not available');

  try {
    let workshopsRaw: unknown;
    try {
      workshopsRaw = await db.execute(sql`
        WITH workshop_data AS (
          SELECT
            w.id, w.title, w.slug, w.description, w.price, w.status, w.media_id, w.meta,
            m.file_path AS media_file_path, m.alt_text AS media_alt_text,
            (SELECT label_nl FROM workshop_categories wc JOIN workshop_taxonomy_mappings wtm ON wc.id = wtm.category_id WHERE wtm.workshop_id = w.id LIMIT 1) as category_label,
            (SELECT label_nl FROM workshop_types wt JOIN workshop_taxonomy_mappings wtm ON wt.id = wtm.type_id WHERE wtm.workshop_id = w.id LIMIT 1) as type_label,
            (SELECT label FROM experience_levels el JOIN workshop_level_mappings wlm ON el.id = wlm.level_id WHERE wlm.workshop_id = w.id LIMIT 1) as level_label
          FROM workshops w
          LEFT JOIN media m ON m.id = w.media_id
          WHERE w.status IN ('publish', 'live') AND w.world_id = 2
        )
        SELECT * FROM workshop_data
        ORDER BY title
      `);
    } catch (taxonomyError: any) {
      // Legacy environments may miss taxonomy tables; keep Studio live with base workshop payload.
      console.warn('[getStudioWorkshopsData] Taxonomy lookup failed, falling back to base workshop query:', taxonomyError?.message || taxonomyError);
      workshopsRaw = await db.execute(sql`
        SELECT
          w.id, w.title, w.slug, w.description, w.price, w.status, w.media_id, w.meta,
          m.file_path AS media_file_path, m.alt_text AS media_alt_text,
          NULL::text AS category_label,
          NULL::text AS type_label,
          NULL::text AS level_label
        FROM workshops w
        LEFT JOIN media m ON m.id = w.media_id
        WHERE w.status IN ('publish', 'live') AND w.world_id = 2
        ORDER BY w.title
      `);
    }

    const workshopsList = Array.isArray(workshopsRaw) ? workshopsRaw : (workshopsRaw as any).rows ?? [];
    const workshopIds = (workshopsList as any[]).map((r) => r.id).filter(Boolean);
    
    if (workshopIds.length === 0) {
      const hero = await getStudioHeroVideo();
      return { workshops: [], instructors: [], faqs: [], ...hero, _meta: { count: 0, fetched_at: new Date().toISOString() } };
    }

    // 2. Fetch Editions (The Planning)
    const editionsData = await safeExecuteRows(sql`
      SELECT
        we.id, we.workshop_id, we.date, we.capacity, we.status,
        we.start_time, we.end_time, we.price as edition_price,
        l.id as location_id, l.name AS location_name, l.city AS location_city, l.address AS location_address, l.zip AS location_zip, l.country AS location_country, l.map_url, l.access_instructions,
        i.id as instructor_id, i.name as instructor_name, i.tagline as instructor_tagline, i.bio as instructor_bio,
        im.file_path as instructor_photo
      FROM workshop_editions we
      LEFT JOIN locations l ON l.id = we.location_id
      LEFT JOIN instructors i ON i.id = we.instructor_id
      LEFT JOIN media im ON im.id = i.photo_id
      WHERE we.workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
        AND we.date >= NOW()
        AND we.status != 'cancelled'
      ORDER BY we.date ASC
    `, 'Editions query');

    // 3. Fetch Reviews
    let reviewsData = await safeExecuteRows(sql`
      SELECT wr.workshop_id, r.id, r.author_name, r.rating, r.text_nl, r.text_en, r.provider, r.author_photo_url
      FROM workshop_reviews wr
      JOIN reviews r ON r.id = wr.review_id
      WHERE wr.workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
      ORDER BY r.rating DESC, r.created_at DESC
    `, 'Workshop reviews mapping query');

    // Fallback for schemas without workshop_reviews mapping table.
    if (reviewsData.length === 0) {
      const globalStudioReviews = await safeExecuteRows(sql`
        SELECT id, author_name, rating, text_nl, text_en, provider, author_photo_url
        FROM reviews
        WHERE business_slug IN ('voices-studio', 'voices-be')
        ORDER BY rating DESC, created_at DESC
        LIMIT 24
      `, 'Global studio reviews fallback query');

      if (globalStudioReviews.length > 0) {
        reviewsData = (workshopsList as any[]).flatMap((workshop) =>
          (globalStudioReviews as any[]).map((review) => ({
            workshop_id: workshop.id,
            ...review,
          }))
        );
      }
    }

    // 4. Fetch Global Instructors & FAQs
    const instructorsData = await safeExecuteRows(sql`
      SELECT i.id, i.name, i.tagline, i.bio, i.preparation_text_template, m.file_path as photo_url
      FROM instructors i
      LEFT JOIN media m ON m.id = i.photo_id
      ORDER BY i.name
    `, 'Instructors query');

    // Fallback-safe FAQ query (faq_mappings table does not exist in current production schema).
    const faqsData = await safeExecuteRows(sql`
      SELECT
        f.id,
        f.question_nl as question,
        f.answer_nl as answer,
        f.category,
        NULL::bigint as workshop_id
      FROM faq f
      WHERE lower(f.category) = 'studio'
      ORDER BY f.display_order ASC NULLS LAST, f.id DESC
    `, 'FAQ query');

    // 4b. Fetch Related Journeys (Next Steps)
    const journeysData = await safeExecuteRows(sql`
      SELECT wj.from_workshop_id, wj.to_workshop_id, wj.label_nl as label, wj.priority,
             w.title as to_title, w.slug as to_slug
      FROM workshop_journeys wj
      JOIN workshops w ON w.id = wj.to_workshop_id
      WHERE wj.from_workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
      ORDER BY wj.priority ASC NULLS LAST
    `, 'Workshop journeys query');

    // 4c. Fetch Public Feedback Snippets
    const feedbackData = await safeExecuteRows(sql`
      SELECT wf.workshop_id, wf.public_snippet, wf.public_rating
      FROM workshop_feedback wf
      WHERE wf.workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
        AND wf.public_snippet IS NOT NULL
      ORDER BY wf.public_rating DESC NULLS LAST, wf.submitted_at DESC
    `, 'Workshop feedback query');

    // 4d. Fetch Video media paths (from meta.video_id)
    const videoIdCandidates = (workshopsList as any[])
      .flatMap((w) => {
        const m = (w.meta as Record<string, any>) || {};
        return [m.video_id, m.aftermovie_video_id].filter(Boolean);
      });
    const normalizedVideoIds = Array.from(
      new Set(
        videoIdCandidates
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    );
    
    let videoPathsMap: Record<number, string> = {};
    if (normalizedVideoIds.length > 0) {
      const videoData = await safeExecuteRows(sql`
        SELECT id, file_path FROM media WHERE id IN (${sql.join(normalizedVideoIds.map((id) => sql`${id}`), sql`, `)})
      `, 'Workshop video lookup query');
      videoPathsMap = (videoData as any[]).reduce((acc, v) => {
        acc[v.id] = v.file_path;
        return acc;
      }, {} as Record<number, string>);
    }

    // 4e. Fetch subtitle tracks via the ID-junction system
    let subtitleRowsData: any[] = [];

    if (workshopIds.length > 0) {
      subtitleRowsData = await safeExecuteRows(sql`
        SELECT
          l.id,
          l.workshop_id,
          l.video_media_id,
          l.video_role,
          l.language_code,
          l.subtitle_media_id,
          l.subtitle_data,
          l.coverage_status,
          l.is_default,
          l.is_enabled,
          m.file_path AS subtitle_file_path
        FROM workshop_video_subtitle_links l
        LEFT JOIN media m ON m.id = l.subtitle_media_id
        WHERE l.workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
          AND l.is_enabled = true
        ORDER BY l.workshop_id ASC, l.video_media_id ASC, l.is_default DESC, l.id ASC
      `, 'Workshop subtitle links query');
    }

    // Include any video IDs found in subtitle links, even if missing/stale in workshop.meta
    const subtitleVideoIds = Array.from(
      new Set(
        (subtitleRowsData as any[])
          .map((row) => Number(row.video_media_id))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    );
    const missingVideoIds = subtitleVideoIds.filter((id) => !videoPathsMap[id]);
    if (missingVideoIds.length > 0) {
      const extraVideoData = await safeExecuteRows(sql`
        SELECT id, file_path FROM media WHERE id IN (${sql.join(missingVideoIds.map((id) => sql`${id}`), sql`, `)})
      `, 'Subtitle fallback video lookup query');
      (extraVideoData as any[]).forEach((row) => {
        videoPathsMap[row.id] = row.file_path;
      });
    }

    const subtitleCoverageByKey = (subtitleRowsData as any[]).reduce((acc, row) => {
      const role = row.video_role || 'video';
      const key = `${row.workshop_id}:${row.video_media_id}:${role}`;
      if (!acc[key]) {
        acc[key] = { total: 0, ready: 0, missing: 0 };
      }
      acc[key].total += 1;
      if (row.coverage_status === 'ready') acc[key].ready += 1;
      if (row.coverage_status === 'missing') acc[key].missing += 1;
      return acc;
    }, {} as Record<string, { total: number; ready: number; missing: number }>);

    const subtitleTracksByKey = (subtitleRowsData as any[]).reduce((acc, row) => {
      const role = row.video_role || 'video';
      const key = `${row.workshop_id}:${row.video_media_id}:${role}`;
      if (!acc[key]) acc[key] = [];

      const payload = (row.subtitle_data as Record<string, any> | null) || null;
      const dataItems = Array.isArray(payload?.items) ? payload.items : null;
      const track = {
        id: row.id,
        src_lang: row.language_code || 'nl-BE',
        label: payload?.label || languageLabelFromCode(row.language_code),
        src: toPublicStorageUrl(row.subtitle_file_path),
        data: dataItems,
        is_default: Boolean(row.is_default),
        subtitle_media_id: row.subtitle_media_id || null,
        coverage_status: row.coverage_status || 'missing',
        video_role: row.video_role || 'video'
      };

      const hasPlayableTrack = Boolean(track.src) || (Array.isArray(track.data) && track.data.length > 0);
      if (hasPlayableTrack) {
        acc[key].push(track);
      }
      return acc;
    }, {} as Record<string, any[]>);

    // 5. Processing & Mapping

    const editionsByWorkshop = (editionsData as any[]).reduce((acc, e) => {
    const wid = String(e.workshop_id);
    if (!acc[wid]) acc[wid] = [];
    acc[wid].push({
      id: e.id,
      date: e.date,
      start_time: e.start_time || null,
      end_time: e.end_time || null,
      price: e.edition_price || null,
      location: e.location_id ? { 
        id: e.location_id, name: e.location_name, city: e.location_city, 
        address: e.location_address, zip: e.location_zip, country: e.location_country, map_url: e.map_url, access_instructions: e.access_instructions 
      } : null,
      instructor: e.instructor_id ? {
        id: e.instructor_id, name: e.instructor_name, tagline: e.instructor_tagline, 
        bio: e.instructor_bio, photo_url: toPublicStorageUrl(e.instructor_photo)
      } : null,
      capacity: e.capacity ?? 8,
      status: e.status
    });
    return acc;
  }, {} as Record<string, any[]>);

    const reviewsByWorkshop = (reviewsData as any[]).reduce((acc, r) => {
    const wid = String(r.workshop_id);
    if (!acc[wid]) acc[wid] = [];
    acc[wid].push({
      id: r.id,
      author_name: r.author_name,
      text: r.text_nl || r.text_en,
      rating: r.rating,
      provider: r.provider,
      author_photo_url: toPublicStorageUrl(r.author_photo_url)
    });
    return acc;
  }, {} as Record<string, any[]>);

    const journeysByWorkshop = (journeysData as any[]).reduce((acc, j) => {
    const wid = String(j.from_workshop_id);
    if (!acc[wid]) acc[wid] = [];
    acc[wid].push({ label: j.label, slug: j.to_slug, title: j.to_title });
    return acc;
  }, {} as Record<string, any[]>);

    const feedbackByWorkshop = (feedbackData as any[]).reduce((acc, f) => {
    const wid = String(f.workshop_id);
    if (!acc[wid]) acc[wid] = [];
    acc[wid].push({ text: f.public_snippet, rating: f.public_rating });
    return acc;
  }, {} as Record<string, any[]>);

    const faqsByWorkshop = (faqsData as any[]).reduce((acc, f) => {
    if (f.workshop_id) {
      const wid = String(f.workshop_id);
      if (!acc[wid]) acc[wid] = [];
      acc[wid].push({ id: f.id, question: f.question, answer: f.answer });
    }
    return acc;
  }, {} as Record<string, any[]>);

    const workshops = (workshopsList as any[]).map((w) => {
    const meta = (w.meta as Record<string, any>) || {};
    const wid = String(w.id);
    const videoId = meta.video_id ? Number(meta.video_id) : null;
    const aftermovieVideoId = meta.aftermovie_video_id ? Number(meta.aftermovie_video_id) : null;
    const videoSubtitleTracks = videoId ? (subtitleTracksByKey[`${w.id}:${videoId}:video`] || []) : [];
    const aftermovieSubtitleTracks = aftermovieVideoId ? (subtitleTracksByKey[`${w.id}:${aftermovieVideoId}:aftermovie`] || []) : [];
    const primaryVideoTrack = videoSubtitleTracks.find((track) => track.is_default) || videoSubtitleTracks[0];
    const resolvedSubtitleData = primaryVideoTrack?.data
      ? {
          lang: primaryVideoTrack.src_lang,
          label: primaryVideoTrack.label,
          items: primaryVideoTrack.data
        }
      : (meta.subtitle_data || null);
    
    return {
      id: w.id,
      title: w.title,
      slug: w.slug,
      description: w.description,
      price: w.price,
      status: w.status,
      is_public: true,
      taxonomy: {
        category: w.category_label || meta.category || 'Voice-over',
        type: w.type_label || meta.type || 'Gastworkshop'
      },
      level: w.level_label || 'Starter',
      lucide_icon: meta.lucide_icon || null,
      skill_dna: meta.skill_dna || {},
      day_schedule: (meta.day_schedule?.items || []).map((item: any) => ({
        time: item.time,
        title: item.label,
        description: item.description || '',
        icon: item.icon
      })),
      expert_note: w.expert_note || meta.expert_note,
      short_description: meta.short_description || w.description || null,
      workshop_content_detail: meta.workshop_content_detail || null,
      aftermovie_description: meta.aftermovie_description || null,
      video: videoId && videoPathsMap[videoId]
        ? { id: videoId, file_path: videoPathsMap[videoId] }
        : null,
      aftermovie_video: aftermovieVideoId && videoPathsMap[aftermovieVideoId]
        ? { id: aftermovieVideoId, file_path: videoPathsMap[aftermovieVideoId] }
        : null,
      subtitle_tracks: videoSubtitleTracks,
      aftermovie_subtitle_tracks: aftermovieSubtitleTracks,
      subtitle_coverage: {
        video: videoId ? (subtitleCoverageByKey[`${w.id}:${videoId}:video`] || { total: 0, ready: 0, missing: 0 }) : { total: 0, ready: 0, missing: 0 },
        aftermovie: aftermovieVideoId ? (subtitleCoverageByKey[`${w.id}:${aftermovieVideoId}:aftermovie`] || { total: 0, ready: 0, missing: 0 }) : { total: 0, ready: 0, missing: 0 }
      },
      subtitle_data: resolvedSubtitleData,
      featured_image: w.media_file_path ? { file_path: w.media_file_path, alt_text: w.media_alt_text } : null,
      has_demo_bundle: false,
      upcoming_editions: editionsByWorkshop[wid] || [],
      reviews: reviewsByWorkshop[wid] || [],
      faqs: faqsByWorkshop[wid] || [],
      next_steps: journeysByWorkshop[wid] || [],
      feedback_snippets: feedbackByWorkshop[wid] || []
    };
  });

    const instructors = (instructorsData as any[]).map(i => ({
    id: i.id, name: i.name, tagline: i.tagline, bio: i.bio, 
    photo_url: toPublicStorageUrl(i.photo_url)
  }));

    const globalFaqs = (faqsData as any[]).filter(f => !f.workshop_id).map(f => ({ id: f.id, question: f.question, answer: f.answer }));

    const hero = await getStudioHeroVideo();

    return {
      workshops,
      instructors,
      faqs: globalFaqs,
      ...hero,
      _meta: { count: workshops.length, fetched_at: new Date().toISOString() },
    };
  } catch (error: any) {
    console.error('[getStudioWorkshopsData] Database Error:', error);
    const hero = await getStudioHeroVideo().catch(() => ({ heroVideoPath: null, heroVideoMediaId: null }));
    return {
      workshops: [],
      instructors: [],
      faqs: [],
      ...hero,
      _meta: { count: 0, fetched_at: new Date().toISOString() },
    };
  }
}
