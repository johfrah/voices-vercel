import { NextResponse } from 'next/server';
import { db, languages } from '@/lib/system/voices-config';
import { asc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN LANGUAGES API (GOD MODE 2026)
 * 
 * Haalt alle ondersteunde talen op uit de database voor de admin interface.
 */
export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, results: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const results = await db.select().from(languages).orderBy(asc(languages.label));

    return NextResponse.json({ 
      success: true, 
      results 
    });

  } catch (error: any) {
    console.error(' ADMIN LANGUAGES FETCH FAILURE:', error);
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}
