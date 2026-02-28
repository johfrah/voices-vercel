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
    featured_image: { file_path: string; alt_text: string | null } | null;
    expert_note: string | null;
    preparation_template: string | null;
    reviews: Array<{
      id: number;
      author_name: string;
      text: string | null;
      rating: number;
      provider: string | null;
      is_google: boolean;
    }>;
    upcoming_editions: Array<{
      id: number;
      date: string;
      location: { name: string; city: string | null; address: string | null } | null;
      capacity: number;
      status: string | null;
    }>;
  }>;
  _meta: { count: number; fetched_at: string };
}

export async function GET() {
  try {
    // CHRIS-PROTOCOL: Raw SQL for Nuclear Integrity (Anti-Drift Mandate)
    // Filter: is_public = true (when column exists) OR status IN ('publish', 'live')
    const workshopsRaw = await db.execute(sql`
      SELECT
        w.id,
        w.title,
        w.slug,
        w.description,
        w.price,
        w.status,
        w.media_id,
        w.meta,
        w.journey,
        m.file_path AS media_file_path,
        m.alt_text AS media_alt_text
      FROM workshops w
      LEFT JOIN media m ON m.id = w.media_id
      WHERE w.status IN ('publish', 'live')
      ORDER BY w.title
    `);

    const workshopsList = Array.isArray(workshopsRaw) ? workshopsRaw : (workshopsRaw as any).rows ?? [];
    const workshopIds = (workshopsList as any[]).map((r) => r.id).filter(Boolean);
    if (workshopIds.length === 0) {
      return NextResponse.json({
        workshops: [],
        _meta: { count: 0, fetched_at: new Date().toISOString() },
      } satisfies WorkshopApiResponse);
    }

    // Fetch upcoming editions with locations
    const editionsRows = await db.execute(
      workshopIds.length > 0
        ? sql`
            SELECT
              we.id,
              we.workshop_id,
              we.date,
              we.capacity,
              we.status,
              l.name AS location_name,
              l.city AS location_city,
              l.address AS location_address
            FROM workshop_editions we
            LEFT JOIN locations l ON l.id = we.location_id
            WHERE we.workshop_id IN (${sql.join(workshopIds.map((id) => sql`${id}`), sql`, `)})
              AND we.date >= NOW()
              AND we.status != 'cancelled'
            ORDER BY we.date ASC
          `
        : sql`SELECT NULL AS id, NULL AS workshop_id, NULL AS date, NULL AS capacity, NULL AS status, NULL AS location_name, NULL AS location_city, NULL AS location_address WHERE false`
    );

    // Fetch reviews: Google (provider = 'google_places') + studio business_slug or iapContext workshopId
    const reviewsRows = await db.execute(sql`
      SELECT
        r.id,
        r.author_name,
        r.rating,
        r.text_nl,
        r.text_en,
        r.provider,
        r.iap_context
      FROM reviews r
      WHERE (
        r.business_slug = 'voices-studio'
        OR r.iap_context->>'workshopId' IS NOT NULL
      )
      ORDER BY COALESCE(r.sentiment_velocity, 0) DESC, r.created_at DESC
      LIMIT 50
    `);

    // Build workshop map with enrichment
    const editionsByWorkshop = (editionsRows as any[]).reduce(
      (acc, e) => {
        const wid = Number(e.workshop_id);
        if (!acc[wid]) acc[wid] = [];
        acc[wid].push({
          id: e.id,
          date: e.date,
          location: e.location_name
            ? { name: e.location_name, city: e.location_city, address: e.location_address }
            : null,
          capacity: e.capacity ?? 8,
          status: e.status,
        });
        return acc;
      },
      {} as Record<number, any[]>
    );

    const reviewsByWorkshop = (reviewsRows as any[]).reduce(
      (acc, r) => {
        const iap = typeof r.iap_context === 'string' ? JSON.parse(r.iap_context || '{}') : r.iap_context || {};
        const wid = iap.workshopId ? Number(iap.workshopId) : null;
        const text = r.text_nl || r.text_en || null;
        const snippet = text ? (text.length > 120 ? text.slice(0, 120) + '...' : text) : null;
        const item = {
          id: r.id,
          author_name: r.author_name,
          text: snippet,
          rating: r.rating,
          provider: r.provider,
          is_google: r.provider === 'google_places',
        };
        if (wid) {
          if (!acc[wid]) acc[wid] = [];
          acc[wid].push(item);
        }
        // Also add to "studio" bucket for workshops without specific link
        if (!acc._studio) acc._studio = [];
        acc._studio.push({ ...item, workshop_id: wid });
        return acc;
      },
      {} as Record<string | number, any[]>
    );

    const workshops: WorkshopApiResponse['workshops'] = (workshopsList as any[]).map((w) => {
      const meta = (w.meta as Record<string, unknown>) || {};
      const taxonomy = {
        category: (meta.category as string) ?? (meta.taxonomy as Record<string, string>)?.category ?? null,
        type: (meta.type as string) ?? (meta.taxonomy as Record<string, string>)?.type ?? null,
      };
      const skill_dna = (meta.skill_dna as Record<string, number>) || {};
      const expert_note = (meta.expert_note as string) ?? null;
      const preparation_template = (meta.preparation_template as string) ?? null;

      const wid = Number(w.id);
      const editions = editionsByWorkshop[wid] || [];
      const linkedReviews = reviewsByWorkshop[wid] || [];
      const studioReviews = (reviewsByWorkshop._studio || [])
        .filter((r: any) => !r.workshop_id || r.workshop_id === wid)
        .slice(0, 3);
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
        skill_dna,
        featured_image: w.media_file_path
          ? { file_path: w.media_file_path, alt_text: w.media_alt_text }
          : null,
        expert_note,
        preparation_template,
        reviews: reviews.map((r: any) => ({
          id: r.id,
          author_name: r.author_name,
          text: r.text,
          rating: r.rating,
          provider: r.provider,
          is_google: r.is_google,
        })),
        upcoming_editions: editions.map((e: any) => ({
          id: e.id,
          date: e.date,
          location: e.location,
          capacity: e.capacity,
          status: e.status,
        })),
      };
    });

    return NextResponse.json({
      workshops,
      _meta: { count: workshops.length, fetched_at: new Date().toISOString() },
    } satisfies WorkshopApiResponse);
  } catch (error) {
    console.error('[Studio Workshops API]:', error);
    return NextResponse.json(
      {
        error: 'Studio workshops fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
