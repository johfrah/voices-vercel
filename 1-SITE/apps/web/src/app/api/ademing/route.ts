import { NextRequest, NextResponse } from 'next/server';
import { db, ademingTracks, ademingStats, ademingReflections } from '@/lib/system/voices-config';
import { eq, desc } from 'drizzle-orm';

/**
 *  ADEMING (MEDITATIE) API
 * 
 * Doel: Ontsluiten van de meditatie-schatkist voor de app of portal.
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const action = searchParams.get('action') || 'tracks';

  try {
    if (action === 'tracks') {
      const tracks = await db.select().from(ademingTracks).where(eq(ademingTracks.is_public, true));
      return NextResponse.json(tracks);
    }

    if (action === 'stats' && userId) {
      const [stats] = await db.select().from(ademingStats).where(eq(ademingStats.user_id, parseInt(userId))).limit(1);
      return NextResponse.json(stats || { streakDays: 0, totalListenSeconds: 0 });
    }

    if (action === 'reflections' && userId) {
      const reflections = await db
        .select()
        .from(ademingReflections)
        .where(eq(ademingReflections.user_id, parseInt(userId)))
        .orderBy(desc(ademingReflections.createdAt));
      return NextResponse.json(reflections);
    }

    return NextResponse.json({ error: 'Invalid action or missing userId' }, { status: 400 });
  } catch (error) {
    console.error('[Ademing API Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, intention, reflection } = body;

    const [newReflection] = await db.insert(ademingReflections).values({
      userId,
      intention,
      reflection
    }).returning();

    return NextResponse.json(newReflection, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
  }
}
