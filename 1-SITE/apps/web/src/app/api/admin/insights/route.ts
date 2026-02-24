import { db } from '@db';
import { users, orders, chatConversations } from '@db/schema';
import { desc, sql, eq, count } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Klant segmentatie op basis van journey_state
    const segmentation = await db.select({
      state: users.journeyState,
      count: count(),
    })
    .from(users)
    .groupBy(users.journeyState);

    // 2. Recente klant activiteit
    const recentActivity = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      lastActive: users.lastActive,
      journeyState: users.journeyState,
    })
    .from(users)
    .orderBy(desc(users.lastActive))
    .limit(10);

    // 3. Gemiddelde order waarde per klant type
    const orderValueStats = await db.select({
      customerType: users.customerType,
      avgTotal: sql<number>`avg(${orders.total})`,
      totalOrders: count(orders.id),
    })
    .from(users)
    .innerJoin(orders, eq(users.id, orders.userId))
    .groupBy(users.customerType);

    // 4. Chat intent analyse (top intents)
    const chatIntents = await db.select({
      intent: chatConversations.intent,
      count: count(),
    })
    .from(chatConversations)
    .where(sql`${chatConversations.intent} IS NOT NULL`)
    .groupBy(chatConversations.intent)
    .orderBy(desc(count()))
    .limit(5);

    return NextResponse.json({
      segmentation,
      recentActivity,
      orderValueStats,
      chatIntents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Insights API Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch insights data' }, { status: 500 });
  }
}
