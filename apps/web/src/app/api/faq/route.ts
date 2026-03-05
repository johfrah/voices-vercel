import { ServerWatchdog } from '@/lib/services/server-watchdog';
import { db } from '@/lib/system/voices-config';
import { createClient } from '@supabase/supabase-js';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const MAX_FAQ_PER_WORLD = 15;

/** BOB: strict journey + world handshake (category + world_id). */
/** CHRIS-PROTOCOL: API payloads snake_case (200-CODE-INTEGRITY) */
export type FaqRowPayload = {
  id: number;
  question_nl: string | null;
  answer_nl: string | null;
  question_en: string | null;
  answer_en: string | null;
  category: string | null;
  world_id: number | null;
  is_public: boolean;
  helpful_count: number;
  display_order: number;
};

const JOURNEY_TO_WORLD: Record<string, number> = {
  agency: 1,
  studio: 2,
  academy: 3,
  portfolio: 5,
  ademing: 6,
  freelance: 7,
  partners: 8,
  johfrai: 10,
  artist: 25,
};

const ALLOWED_JOURNEYS = new Set<string>([
  'general',
  ...Object.keys(JOURNEY_TO_WORLD),
]);

function toSnakePayload(row: Record<string, unknown>): FaqRowPayload {
  return {
    id: Number(row.id),
    question_nl: (row.question_nl ?? row.questionNl) as string | null ?? null,
    answer_nl: (row.answer_nl ?? row.answerNl) as string | null ?? null,
    question_en: (row.question_en ?? row.questionEn) as string | null ?? null,
    answer_en: (row.answer_en ?? row.answerEn) as string | null ?? null,
    category: (row.category as string | null) ?? null,
    world_id: row.world_id == null ? null : Number(row.world_id ?? row.worldId),
    is_public: Boolean(row.is_public ?? row.isPublic),
    helpful_count: Number(row.helpful_count ?? row.helpfulCount ?? 0),
    display_order: Number(row.display_order ?? row.displayOrder ?? 0),
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedJourney = (searchParams.get('journey') || 'general').toLowerCase().trim();
  const journey = ALLOWED_JOURNEYS.has(requestedJourney) ? requestedJourney : 'general';
  const worldIdParam = searchParams.get('world_id');
  const requestedLimit = parseInt(searchParams.get('limit') || '3');
  const parsedWorldId = worldIdParam ? Number.parseInt(worldIdParam, 10) : null;
  const inferredWorldId = journey === 'general' ? null : (JOURNEY_TO_WORLD[journey] ?? null);
  const resolvedWorldId = parsedWorldId ?? inferredWorldId;
  const limit = Math.min(requestedLimit, MAX_FAQ_PER_WORLD);

  if (isNaN(requestedLimit) || requestedLimit < 1) {
    return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
  }
  if (worldIdParam && (Number.isNaN(parsedWorldId ?? NaN) || (parsedWorldId ?? 0) < 0)) {
    return NextResponse.json({ error: 'Invalid world_id parameter' }, { status: 400 });
  }

  try {
    let results: Record<string, unknown>[] = [];
    const journeyFilter =
      journey === 'general'
        ? sql`f.category = 'general'`
        : sql`f.category in (${journey}, 'general')`;
    const worldFilter =
      resolvedWorldId == null
        ? sql`f.world_id is null`
        : sql`(f.world_id = ${resolvedWorldId} or f.world_id is null)`;

    try {
      const query = sql`
        select
          f.id,
          f.question_nl,
          f.answer_nl,
          f.question_en,
          f.answer_en,
          f.category,
          f.world_id,
          f.is_public,
          coalesce(f.helpful_count, 0) as helpful_count,
          coalesce(f.display_order, 0) as display_order
        from faq f
        where f.is_public = true
          and ${journeyFilter}
          and ${worldFilter}
        order by coalesce(f.display_order, 0) asc, coalesce(f.helpful_count, 0) desc
        limit ${limit}
      `;
      const rows = await db.execute(query);
      results = (rows as { rows?: unknown[] } | unknown[]) as Record<string, unknown>[];
      if (Array.isArray((rows as { rows?: unknown[] }).rows)) {
        results = ((rows as { rows: unknown[] }).rows as Record<string, unknown>[]);
      }
    } catch (dbError) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      ServerWatchdog.report({
        error: `FAQ Drizzle failed, falling back to SDK: ${msg}`,
        component: 'api/faq',
        level: 'warn',
      });
      let query = supabase
        .from('faq')
        .select('*')
        .eq('is_public', true);

      query = journey === 'general'
        ? query.eq('category', 'general')
        : query.in('category', [journey, 'general']);

      query = resolvedWorldId == null
        ? query.is('world_id', null)
        : query.or(`world_id.eq.${resolvedWorldId},world_id.is.null`);

      const { data, error } = await query
        .order('display_order', { ascending: true })
        .order('helpful_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      results = (data || []).map((item: Record<string, unknown>) => ({
        ...item,
        world_id: item.world_id ?? item.worldId ?? null,
        helpful_count: item.helpful_count ?? item.helpfulCount,
        display_order: item.display_order ?? item.displayOrder,
      })) as Record<string, unknown>[];
    }

    const payload: FaqRowPayload[] = results.map((r) => toSnakePayload(r));
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    ServerWatchdog.report({
      error: `FAQ API failure: ${message}`,
      stack: err instanceof Error ? err.stack : undefined,
      component: 'api/faq',
      level: 'error',
    });
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
