import { ServerWatchdog } from '@/lib/services/server-watchdog';
import { db, faq } from '@/lib/system/voices-config';
import { createClient } from '@supabase/supabase-js';
import { and, desc, eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** BOB: category = journey (studio/academy/agency/general). Optional world_id filter can be added later for stricter World alignment. */
/** CHRIS-PROTOCOL: API payloads snake_case (200-CODE-INTEGRITY) */
export type FaqRowPayload = {
  id: number;
  question_nl: string | null;
  answer_nl: string | null;
  question_en: string | null;
  answer_en: string | null;
  category: string | null;
  is_public: boolean;
  helpful_count: number;
  display_order: number;
};

function toSnakePayload(row: Record<string, unknown>): FaqRowPayload {
  return {
    id: Number(row.id),
    question_nl: (row.question_nl ?? row.questionNl) as string | null ?? null,
    answer_nl: (row.answer_nl ?? row.answerNl) as string | null ?? null,
    question_en: (row.question_en ?? row.questionEn) as string | null ?? null,
    answer_en: (row.answer_en ?? row.answerEn) as string | null ?? null,
    category: (row.category as string | null) ?? null,
    is_public: Boolean(row.is_public ?? row.is_public),
    helpful_count: Number(row.helpful_count ?? row.helpfulCount ?? 0),
    display_order: Number(row.display_order ?? row.displayOrder ?? 0),
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const journey = searchParams.get('journey') || 'general';
  const limit = parseInt(searchParams.get('limit') || '3');

  if (isNaN(limit) || limit < 1 || limit > 50) {
    return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
  }

  try {
    let results: Record<string, unknown>[] = [];
    try {
      const rows = await db.select()
        .from(faq)
        .where(
          and(
            eq(faq.is_public, true),
            or(
              eq(faq.category, journey),
              eq(faq.category, 'general'),
              eq(faq.category, 'pricing'),
              eq(faq.category, 'service'),
              eq(faq.category, 'agency'),
              eq(faq.category, 'studio'),
              eq(faq.category, 'academy')
            )
          )
        )
        .orderBy(desc(faq.helpfulCount))
        .limit(limit);
      results = rows as Record<string, unknown>[];
    } catch (dbError) {
      const msg = dbError instanceof Error ? dbError.message : String(dbError);
      ServerWatchdog.report({
        error: `FAQ Drizzle failed, falling back to SDK: ${msg}`,
        component: 'api/faq',
        level: 'warn',
      });
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('is_public', true)
        .or(`category.eq.${journey},category.eq.general,category.eq.pricing,category.eq.service,category.eq.agency,category.eq.studio,category.eq.academy`)
        .order('helpful_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      results = (data || []).map((item: Record<string, unknown>) => ({
        ...item,
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
