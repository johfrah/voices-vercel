import { db } from '@db';
import { funnelEvents, workshopInterest, orders } from '@db/schema';
import { desc, sql, eq, count, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Funnel stappen aggregatie
    const funnelSteps = await db.select({
      step: funnelEvents.step,
      count: count(),
    })
    .from(funnelEvents)
    .groupBy(funnelEvents.step)
    .orderBy(desc(count()));

    // 2. Workshop interesse status
    const interestStats = await db.select({
      status: workshopInterest.status,
      count: count(),
    })
    .from(workshopInterest)
    .groupBy(workshopInterest.status);

    // 3. Conversie naar orders (workshop journey)
    const workshopOrders = await db.select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .where(eq(orders.journey, 'studio'))
    .groupBy(orders.status);

    // 4. Laatste funnel events
    const recentEvents = await db.select()
      .from(funnelEvents)
      .orderBy(desc(funnelEvents.createdAt))
      .limit(20);

    return NextResponse.json({
      funnelSteps,
      interestStats,
      workshopOrders,
      recentEvents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Funnel API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
  }
}
