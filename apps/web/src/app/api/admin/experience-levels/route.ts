import { NextResponse } from 'next/server';
import { db, experienceLevels } from '@/lib/system/voices-config';
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
    const results = await db.select().from(experienceLevels).orderBy(asc(experienceLevels.label));
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error(' ADMIN EXPERIENCE LEVELS FETCH FAILURE:', error);
    return NextResponse.json({ error: 'Failed to fetch experience levels' }, { status: 500 });
  }
}
