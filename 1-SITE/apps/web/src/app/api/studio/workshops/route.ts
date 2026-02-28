/**
 * NUCLEAR STUDIO WORKSHOPS API (2026)
 *
 * Fetches all public workshops with full enrichment:
 * - Taxonomy (Category, Type from meta)
 * - Skill DNA (6 pillars from meta)
 * - Featured Image (via media_id)
 * - Expert Note, Preparation Template (from meta)
 * - Public Reviews (Google + ge-anonimiseerde snippets)
 * - Upcoming Editions (with location data)
 * - Instructors & FAQs for World Overview
 * - Smart Schedule (Inheritance: Edition override OR Workshop blueprint)
 *
 * @protocol CHRIS-PROTOCOL: db.execute(sql) for Nuclear Integrity
 * @filter is_public = true OR status IN ('publish', 'live')
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface WorkshopApiResponse {
  workshops: Array<{
    id: number;
    title: string;
    slug: string | null;
    description: string | null;
    price: string | null;
    status: string | null;
    journey: string | null;
    taxonomy: { category: string | null; type: string | null };
    skill_dna: Record<string, number>;
    level: string | null;
    featured_image: { file_path: string; alt_text: string | null } | null;
    expert_note: string | null;
    preparation_template: string | null;
    day_schedule: any; // Smart Schedule
    reviews: Array<{
      id: number;
      author_name: string;
      text: string | null;
      rating: number;
      provider: string | null;
      is_google: boolean;
      metadata?: string;
    }>;
    upcoming_editions: Array<{
      id: number;
      date: string;
      location: { id: number; name: string; city: string | null; address: string | null; map_url?: string; access_instructions?: string } | null;
      instructor: { id: number; name: string; photo_url: string | null; bio: string | null; tagline: string | null } | null;
      capacity: number;
      status: string | null;
      day_schedule_override: any;
    }>;
  }>;
  instructors: Array<{
    id: number;
    name: string;
    tagline: string | null;
    bio: string | null;
    photo_url: string | null;
    preparation_text_template: string | null;
  }>;
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
    category: string | null;
  }>;
  _meta: { count: number; fetched_at: string };
}

export async function GET() {
  try {
    // 1. Fetch Workshops
    const workshopsRaw = await db.execute(sql`
      SELECT
        w.id, w.title, w.slug, w.description, w.price, w.status, w.media_id, w.meta, w.journey,
        m.file_path AS media_file_path, m.alt_text AS media_alt_text
      FROM workshops w
      LEFT JOIN media m ON m.id = w.media_id
      WHERE w.status IN ('publish', 'live')
      ORDER BY w.title
    `);

    const workshopsList = Array.isArray(workshopsRaw) ? workshopsRaw : (workshopsRaw as any).rows ?? [];
    const workshopIds = (workshopsList as any[]).map((r) => r.id).filter(Boolean);
    
    if (workshopIds.length === 0) {
      return NextResponse.json({ workshops: [], instructors: [], faqs: [], _meta: { count: 0, fetched_at: new Date().toISOString() } });
    }

    // 2. Fetch Editions with Locations and Instructors
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

    // 3. Fetch Reviews & Feedback
    const reviewsRows = await db.execute(sql`
      SELECT r.id, r.author_name, r.rating, r.text_nl, r.text_en, r.provider, r.iap_context
      FROM reviews r
      WHERE r.business_slug = 'voices-studio' OR r.iap_context->>'workshopId' IS NOT NULL
      ORDER BY COALESCE(r.sentiment_velocity, 0) DESC, r.created_at DESC
      LIMIT 50
    `);

    const feedbackRows = await db.execute(sql`
      SELECT wf.workshop_id, wf.public_snippet as text, wf.public_rating as rating, we.date as edition_date, w.title as workshop_title
      FROM workshop_feedback wf
      JOIN workshops w ON w.id = wf.workshop_id
      LEFT JOIN workshop_editions we ON we.id = wf.edition_id
      WHERE wf.public_snippet IS NOT NULL
      ORDER BY wf.submitted_at DESC
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
      SELECT f.id, f.question_nl as question, f.answer_nl as answer, f.category
      FROM faq f
      WHERE f.category = 'studio'
      ORDER BY f.display_order ASC NULLS LAST
    `);

    // 5. Processing & Mapping
    const editionsByWorkshop = (editionsRows as any[]).reduce((acc, e) => {
      const wid = Number(e.workshop_id);
      if (!acc[wid]) acc[wid] = [];
      const eMeta = (e.edition_meta as any) || {};
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
        status: e.status,
        day_schedule_override: eMeta.day_schedule || null
      });
      return acc;
    }, {} as Record<number, any[]>);

    const reviewsByWorkshop = (reviewsRows as any[]).reduce((acc, r) => {
      const iap = typeof r.iap_context === 'string' ? JSON.parse(r.iap_context || '{}') : r.iap_context || {};
      const wid = iap.workshopId ? Number(iap.workshopId) : null;
      const text = r.text_nl || r.text_en || null;
      const snippet = text ? (text.length > 150 ? text.slice(0, 150) + '...' : text) : null;
      const item = { id: r.id, author_name: r.author_name, text: snippet, rating: r.rating, provider: r.provider, is_google: r.provider === 'google_places' };
      if (wid) { if (!acc[wid]) acc[wid] = []; acc[wid].push(item); }
      if (!acc._studio) acc._studio = []; acc._studio.push({ ...item, workshop_id: wid });
      return acc;
    }, {} as Record<string | number, any[]>);

    (feedbackRows as any[]).forEach((f) => {
      const wid = Number(f.workshop_id);
      const dateStr = f.edition_date ? new Date(f.edition_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'onlangs';
      const item = { id: Math.random(), author_name: `Deelnemer ${f.workshop_title}`, text: f.text, rating: f.rating, provider: 'internal', is_google: false, metadata: `Workshop op ${dateStr}` };
      if (!reviewsByWorkshop[wid]) reviewsByWorkshop[wid] = []; reviewsByWorkshop[wid].push(item);
      if (!reviewsByWorkshop._studio) reviewsByWorkshop._studio = []; reviewsByWorkshop._studio.push(item);
    });

    const workshops: WorkshopApiResponse['workshops'] = (workshopsList as any[]).map((w) => {
      const meta = (w.meta as Record<string, unknown>) || {};
      const taxonomy = {
        category: (meta.category as string) ?? (meta.taxonomy as Record<string, string>)?.category ?? null,
        type: (meta.type as string) ?? (meta.taxonomy as Record<string, string>)?.type ?? null,
      };
      const wid = Number(w.id);
      const editions = editionsByWorkshop[wid] || [];
      const linkedReviews = reviewsByWorkshop[wid] || [];
      const studioReviews = (reviewsByWorkshop._studio || []).filter((r: any) => !r.workshop_id || r.workshop_id === wid).slice(0, 3);
      const reviews = [...linkedReviews, ...studioReviews].slice(0, 10);

      return {
        id: wid,
        title: w.title,
        slug: w.slug,
        description: w.description,
        price: w.price,
        status: w.status,
        journey: w.journey,
        taxonomy,
        skill_dna: (meta.skill_dna as Record<string, number>) || {},
        level: (meta.level as string) || 'Starter',
        featured_image: w.media_file_path ? { file_path: w.media_file_path, alt_text: w.media_alt_text } : null,
        expert_note: (meta.expert_note as string) ?? null,
        preparation_template: (meta.preparation_template as string) ?? null,
        day_schedule: meta.day_schedule || null,
        reviews: reviews.map((r: any) => ({
          id: r.id, author_name: r.author_name, text: r.text, rating: r.rating, 
          provider: r.provider, is_google: r.is_google, metadata: r.metadata
        })),
        upcoming_editions: editions,
      };
    });

    const instructors = (instructorsRows as any[]).map(i => ({
      id: i.id, name: i.name, tagline: i.tagline, bio: i.bio, 
      preparation_text_template: i.preparation_text_template,
      photo_url: i.photo_url ? `https://vcbxyyjsxuquytcsskpj.supabase.co/storage/v1/object/public/voices/${i.photo_url}` : null
    }));

    const faqs = (faqsRows as any[]).map(f => ({ id: f.id, question: f.question, answer: f.answer, category: f.category }));

    return NextResponse.json({
      workshops, instructors, faqs,
      _meta: { count: workshops.length, fetched_at: new Date().toISOString() },
    } satisfies WorkshopApiResponse);
  } catch (error) {
    console.error('[Studio Workshops API]:', error);
    return NextResponse.json({ error: 'Studio workshops fetch failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
