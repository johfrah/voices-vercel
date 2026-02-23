import { NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN ACTOR TAGS API (GOD MODE 2026)
 * 
 * Haalt alle unieke tone_of_voice tags op uit de database.
 */
export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, tags: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const allActors = await db.select({ toneOfVoice: actors.toneOfVoice }).from(actors);
    
    const tagsSet = new Set<string>();
    allActors.forEach(a => {
      if (a.toneOfVoice) {
        a.toneOfVoice.split(',').forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) tagsSet.add(trimmed);
        });
      }
    });

    return NextResponse.json({ 
      success: true, 
      tags: Array.from(tagsSet).sort() 
    });

  } catch (error: any) {
    console.error(' ADMIN TAGS FETCH FAILURE:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
