import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { reviews, actors } from '@db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  REVIEW INTELLIGENCE API (GODMODE)
 * 
 * Doel: Sentiment-analyse en performance scoring van reviews.
 * Ontsluit de "best presterende" stemmen per categorie.
 */

export async function GET(request: NextRequest) {
  //  LEX-MANDATE: Admin only access for intelligence data
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const actorId = searchParams.get('actorId');
  const category = searchParams.get('category');
  const minRating = parseInt(searchParams.get('minRating') || '4');

  try {
    // 1. Als actorId is meegegeven, geef specifieke intelligentie voor die acteur
    if (actorId) {
      const actorReviews = await db
        .select()
        .from(reviews)
        .where(sql`${reviews.iapContext}->>'actorId' = ${actorId}`)
        .orderBy(desc(reviews.createdAt))
        .catch(() => []);

      const avgConversion = actorReviews.reduce((acc, r) => acc + Number(r.conversionScore || 0), 0) / (actorReviews.length || 1);

      return NextResponse.json({
        actorId,
        reviewCount: actorReviews.length,
        averageConversionScore: avgConversion.toFixed(2),
        sentimentVelocity: actorReviews[0]?.sentimentVelocity || 0,
        reviews: actorReviews
      });
    }

    // 2. Geef de "Top Performing" stemmen op basis van reviews
    const topActors = await db
      .select({
        actorId: sql`${reviews.iapContext}->>'actorId'`,
        avgRating: sql`AVG(${reviews.rating})`,
        count: sql`COUNT(${reviews.id})`,
        totalConversion: sql`SUM(${reviews.conversionScore})`
      })
      .from(reviews)
      .groupBy(sql`${reviews.iapContext}->>'actorId'`)
      .having(sql`AVG(${reviews.rating}) >= ${minRating}`)
      .orderBy(desc(sql`SUM(${reviews.conversionScore})`))
      .limit(10)
      .catch(() => []);

    return NextResponse.json(topActors);
  } catch (error) {
    console.error('[Review Intelligence Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
