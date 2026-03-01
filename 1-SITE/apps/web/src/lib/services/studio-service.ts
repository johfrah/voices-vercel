import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

export interface WorkshopApiResponse {
  workshops: any[];
  instructors: any[];
  faqs: any[];
  _meta: { count: number; fetched_at: string };
}

/**
 * ☢️ NUCLEAR STUDIO SERVICE (v2.16.103)
 * 
 * Absolute Source of Truth voor de Studio World.
 * Connects the dots tussen workshops, junction tables (taxonomy, reviews, faq) 
 * en de frontend instruments.
 */
export async function getStudioWorkshopsData(): Promise<WorkshopApiResponse> {
  if (!db) throw new Error('Database not available');

  try {
    // 1. Fetch Workshops with all junction data in one go (Nuclear Handshake)
    const workshopsRaw = await db.execute(sql`
      WITH workshop_data AS (
        SELECT
          w.id, w.title, w.slug, w.description, w.price, w.status, w.media_id, w.meta, w.is_public,
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

    const workshopsList = Array.isArray(workshopsRaw) ? workshopsRaw : (workshopsRaw as any).rows ?? [];
    const workshopIds = (workshopsList as any[]).map((r) => r.id).filter(Boolean);
    
    if (workshopIds.length === 0) {
      return { workshops: [], instructors: [], faqs: [], _meta: { count: 0, fetched_at: new Date().toISOString() } };
    }

    // 2. Fetch Editions (The Planning)
    const editionsRows = await db.execute(sql`
      SELECT
        we.id, we.workshop_id, we.date, we.capacity, we.status, we.meta as edition_meta,
        l.id as location_id, l.name AS location_name, l.city AS location_city, l.address AS location_address, l.map_url, l.access_instructions,
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
    `);

    // 3. Fetch Reviews (Hard Handshake via junction table)
    const reviewsRows = await db.execute(sql`
    SELECT wr.workshop_id, r.id, r.author_name, r.rating, r.text_nl, r.text_en, r.provider
    FROM workshop_reviews wr
    JOIN reviews r ON r.id = wr.review_id
    WHERE wr.workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
    ORDER BY r.rating DESC, r.created_at DESC
  `);

  // 4. Fetch Global Instructors & FAQs
  const instructorsRows = await db.execute(sql`
    SELECT i.id, i.name, i.tagline, i.bio, i.preparation_text_template, m.file_path as photo_url
    FROM instructors i
    LEFT JOIN media m ON m.id = i.photo_id
    WHERE i.name IN ('Johfrah Lefebvre', 'Bernadette Timmermans', 'Goedele Wachters', 'Kristien Maes', 'Annemie Tweepenninckx', 'Lucas Derycke')
    ORDER BY i.name
  `);

  const faqsRows = await db.execute(sql`
    SELECT f.id, f.question_nl as question, f.answer_nl as answer, f.category, fm.workshop_id
    FROM faq f
    LEFT JOIN faq_mappings fm ON f.id = fm.faq_id
    WHERE f.category = 'studio' OR fm.workshop_id IS NOT NULL
    ORDER BY f.display_order ASC NULLS LAST
  `);

    // 5. Processing & Mapping
    const editionsData = Array.isArray(editionsRows) ? editionsRows : (editionsRows as any).rows || [];
    const reviewsData = Array.isArray(reviewsRows) ? reviewsRows : (reviewsRows as any).rows || [];
    const instructorsData = Array.isArray(instructorsRows) ? instructorsRows : (instructorsRows as any).rows || [];
    const faqsData = Array.isArray(faqsRows) ? faqsRows : (faqsRows as any).rows || [];

    const editionsByWorkshop = (editionsData as any[]).reduce((acc, e) => {
    const wid = String(e.workshop_id);
    if (!acc[wid]) acc[wid] = [];
    acc[wid].push({
      id: e.id,
      date: e.date,
      location: e.location_id ? { 
        id: e.location_id, name: e.location_name, city: e.location_city, 
        address: e.location_address, map_url: e.map_url, access_instructions: e.access_instructions 
      } : null,
      instructor: e.instructor_id ? {
        id: e.instructor_id, name: e.instructor_name, tagline: e.instructor_tagline, 
        bio: e.instructor_bio, photo_url: e.instructor_photo ? `https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${e.instructor_photo}` : null
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
      provider: r.provider
    });
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
    
    return {
      id: w.id,
      title: w.title,
      slug: w.slug,
      description: w.description,
      price: w.price,
      status: w.status,
      is_public: w.is_public,
      taxonomy: {
        category: w.category_label || meta.category || 'Voice-over',
        type: w.type_label || meta.type || 'Gastworkshop'
      },
      level: w.level_label || 'Starter',
      skill_dna: meta.skill_dna || {},
      expert_note: w.expert_note || meta.expert_note,
      featured_image: w.media_file_path ? { file_path: w.media_file_path, alt_text: w.media_alt_text } : null,
      upcoming_editions: editionsByWorkshop[wid] || [],
      reviews: reviewsByWorkshop[wid] || [],
      faqs: faqsByWorkshop[wid] || []
    };
  });

    const instructors = (instructorsData as any[]).map(i => ({
    id: i.id, name: i.name, tagline: i.tagline, bio: i.bio, 
    photo_url: i.photo_url ? `https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${i.photo_url}` : null
  }));

    const globalFaqs = (faqsData as any[]).filter(f => !f.workshop_id).map(f => ({ id: f.id, question: f.question, answer: f.answer }));

    return {
      workshops,
      instructors,
      faqs: globalFaqs,
      _meta: { count: workshops.length, fetched_at: new Date().toISOString() },
    };
  } catch (error: any) {
    console.error('[getStudioWorkshopsData] Database Error:', error);
    throw new Error(`Database query failed: ${error.message || 'Unknown error'}`);
  }
}
