import { db } from '@/lib/system/db';
import { orders, users, orderItems, actors } from '@/lib/system/db';
import { eq, and, lte, gte, sql, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { VumeEngine } from '@/lib/mail/VumeEngine';

export const dynamic = 'force-dynamic';

/**
 * 🕒 CRON: NEW CUSTOMER FOLLOW-UP (2026)
 * 
 * Doel: Bereidt follow-up e-mails voor nieuwe klanten voor, 7 dagen na hun eerste bestelling.
 * 🛡️ CHRIS-PROTOCOL: HITL MANDATE (v2.14.332)
 * Deze cron verstuurt NIET meer automatisch. Hij markeert orders als 'ready_for_followup'.
 * De admin (Johfrah) moet deze verzenden via het dashboard.
 */
export async function GET() {
  try {
    console.log('🚀 Starting New Customer Follow-up Preparation...');

    // 1. Bereken de datum van exact 7 dagen geleden
    const sevenDaysAgoStart = new Date();
    sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 7);
    sevenDaysAgoStart.setHours(0, 0, 0, 0);

    const sevenDaysAgoEnd = new Date();
    sevenDaysAgoEnd.setDate(sevenDaysAgoEnd.getDate() - 7);
    sevenDaysAgoEnd.setHours(23, 59, 59, 999);

    // 2. Zoek orders van 7 dagen geleden
    const recentOrders = await db.select({
      id: orders.id,
      userId: orders.userId,
      createdAt: orders.createdAt,
      rawMeta: orders.rawMeta
    })
    .from(orders)
    .where(and(
      gte(orders.createdAt, sevenDaysAgoStart),
      lte(orders.createdAt, sevenDaysAgoEnd),
      eq(orders.status, 'paid') 
    ));

    console.log(`🔍 Found ${recentOrders.length} potential orders for follow-up.`);

    let readyCount = 0;

    for (const order of recentOrders) {
      if (!order.userId) continue;

      // 3. Check of dit de EERSTE en ENIGE order is
      const userOrders = await db.select({ count: count() })
        .from(orders)
        .where(eq(orders.userId, order.userId));
      
      const isNewCustomer = userOrders[0].count === 1;

      if (!isNewCustomer) continue;

      // 4. Check of we al een follow-up hebben gestuurd of klaargezet
      const hasFollowUp = (order.rawMeta as any)?.followUpSent === true || (order.rawMeta as any)?.followUpReady === true;
      if (hasFollowUp) continue;

      // 5. Markeer als 'ready' voor admin review
      await db.update(orders)
        .set({ 
          rawMeta: { ...(order.rawMeta as any), followUpReady: true } 
        })
        .where(eq(orders.id, order.id));

      readyCount++;
    }

    return NextResponse.json({ success: true, processed: recentOrders.length, readyForReview: readyCount });
  } catch (error: any) {
    console.error('❌ Follow-up Cron Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
