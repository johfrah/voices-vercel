import { db, reviews, actors, users } from '@/lib/system/voices-config';
import { eq, desc, sql, and, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: PUBLIC REVIEWS (2026)
 *  Ondersteunt journey-aware filtering (Bob-methode)
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const journeyId = searchParams.get('journeyId');
  const worldId = searchParams.get('worldId');
  const actorId = searchParams.get('actorId');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    let query = db.select({
      id: reviews.id,
      rating: reviews.rating,
      textNl: reviews.textNl,
      textFr: reviews.textFr,
      textEn: reviews.textEn,
      authorName: reviews.authorName,
      createdAt: reviews.createdAt,
      journeyId: reviews.journeyId,
      worldId: reviews.worldId,
    }).from(reviews);

    const conditions = [];

    if (actorId) {
      // Gebruik de nieuwe koppeltabel of iapContext fallback
      conditions.push(sql`${reviews.iapContext}->>'actorId' = ${actorId}`);
    }

    if (journeyId) {
      conditions.push(eq(reviews.journeyId, journeyId));
    }

    if (worldId) {
      conditions.push(eq(reviews.worldId, worldId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .catch(() => []);

    return NextResponse.json(results);
  } catch (error) {
    console.error('[Public Reviews GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
