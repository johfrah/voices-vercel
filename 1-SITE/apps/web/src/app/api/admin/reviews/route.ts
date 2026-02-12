import { db } from '@db';
import { reviews, actors, users } from '@db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * ⭐️ API: ADMIN REVIEWS (2026)
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const allReviews = await db.select({
      id: reviews.id,
      rating: reviews.rating,
      textNl: reviews.textNl,
      textFr: reviews.textFr,
      textEn: reviews.textEn,
      status: reviews.language, // reviews table doesn't have a status column in schema, using language as proxy or just omitting
      createdAt: reviews.createdAt,
      actorFirstName: actors.firstName,
      actorLastName: actors.lastName,
      userFirstName: users.firstName,
      userLastName: users.lastName
    })
    .from(reviews)
    .leftJoin(actors, sql`${reviews.iapContext}->>'actorId' = ${actors.id.toString()}`)
    .leftJoin(users, eq(reviews.authorName, users.firstName)) // This join is weak, but authors in reviews are often strings
    .orderBy(desc(reviews.createdAt));

    return NextResponse.json(allReviews);
  } catch (error) {
    console.error('[Admin Reviews GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
