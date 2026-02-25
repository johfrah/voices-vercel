import { db, utmTouchpoints, visitors } from '@/lib/system/voices-config';
import { desc, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Haal de laatste UTM touchpoints op
    const touchpoints = await db.select()
      .from(utmTouchpoints)
      .orderBy(desc(utmTouchpoints.createdAt))
      .limit(100);

    // 2. Aggregatie statistieken voor UTM bronnen
    const sourceStats = await db.select({
      source: utmTouchpoints.source,
      count: sql<number>`count(*)`,
    })
    .from(utmTouchpoints)
    .groupBy(utmTouchpoints.source)
    .orderBy(sql`count(*) desc`);

    // 3. Aggregatie voor campagnes
    const campaignStats = await db.select({
      campaign: utmTouchpoints.campaign,
      count: sql<number>`count(*)`,
    })
    .from(utmTouchpoints)
    .where(sql`${utmTouchpoints.campaign} IS NOT NULL`)
    .groupBy(utmTouchpoints.campaign)
    .orderBy(sql`count(*) desc`);

    return NextResponse.json({
      touchpoints,
      stats: {
        sources: sourceStats,
        campaigns: campaignStats,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[UTM API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch UTM data' }, { status: 500 });
  }
}
