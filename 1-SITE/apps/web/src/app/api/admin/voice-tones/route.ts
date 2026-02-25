import { NextResponse } from 'next/server';
import { db, voiceTones } from '@/lib/system/voices-config';
import { asc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, results: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const results = await db.select().from(voiceTones).orderBy(asc(voiceTones.label));
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error(' ADMIN VOICE TONES FETCH FAILURE:', error);
    return NextResponse.json({ error: 'Failed to fetch voice tones' }, { status: 500 });
  }
}
