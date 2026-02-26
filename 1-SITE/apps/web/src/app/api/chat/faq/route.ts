import { db, faq } from '@/lib/system/voices-config';
import { ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: CHAT FAQ (2026)
 *  Native FAQ Search in Supabase
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lang = searchParams.get('lang') || 'nl';

  if (!q) {
    return NextResponse.json({ success: true, faqs: [] });
  }

  try {
    const results = await db
      .select()
      .from(faq)
      .where(
        or(
          ilike(faq.questionNl, `%${q}%`),
          ilike(faq.answerNl, `%${q}%`),
          ilike(faq.questionEn, `%${q}%`),
          ilike(faq.answerEn, `%${q}%`)
        )
      )
      .limit(3);

    return NextResponse.json({
      success: true,
      faqs: results.map((f: any) => ({
        id: f.id,
        question: lang === 'nl' ? f.questionNl : f.questionEn,
        answer: lang === 'nl' ? f.answerNl : f.answerEn
      }))
    });
  } catch (error) {
    console.error('[Chat FAQ API Error]:', error);
    return NextResponse.json({ error: 'FAQ search failed' }, { status: 500 });
  }
}
