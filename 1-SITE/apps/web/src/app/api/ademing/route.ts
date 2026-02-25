import { NextRequest, NextResponse } from 'next/server';
import { db, ademingTracks, ademingStats, ademingReflections, ademingSeries, ademingMakers, ademingBackgroundMusic } from '@/lib/system/voices-config';
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
  const slug = searchParams.get('slug');

  try {
    if (action === 'tracks') {
      if (slug) {
        const [track] = await db.select().from(ademingTracks).where(eq(ademingTracks.slug, slug)).limit(1);
        return NextResponse.json(track);
      }
      const tracks = await db.select().from(ademingTracks).where(eq(ademingTracks.is_public, true));
      return NextResponse.json(tracks);
    }

    if (action === 'series') {
      if (slug) {
        const [series] = await db.select().from(ademingSeries).where(eq(ademingSeries.slug, slug)).limit(1);
        const tracks = await db.select().from(ademingTracks).where(eq(ademingTracks.seriesId, series.id)).orderBy(ademingTracks.seriesOrder);
        return NextResponse.json({ ...series, tracks });
      }
      const seriesList = await db.select().from(ademingSeries).where(eq(ademingSeries.is_public, true));
      return NextResponse.json(seriesList);
    }

    if (action === 'makers') {
      if (slug) {
        const [maker] = await db.select().from(ademingMakers).where(eq(ademingMakers.short_name, slug)).limit(1);
        return NextResponse.json(maker);
      }
      const makers = await db.select().from(ademingMakers).where(eq(ademingMakers.is_public, true));
      return NextResponse.json(makers);
    }

    if (action === 'background-music') {
      const music = await db.select().from(ademingBackgroundMusic).where(eq(ademingBackgroundMusic.is_active, true));
      return NextResponse.json(music);
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
      user_id: userId,
      intention,
      reflection
    }).returning();

    return NextResponse.json(newReflection, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
  }
}
