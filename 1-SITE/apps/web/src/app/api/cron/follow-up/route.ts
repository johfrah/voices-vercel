import { db } from '@db';
import { orders, users, orderItems, actors } from '@db/schema';
import { eq, and, lte, gte, sql, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { VumeEngine } from '@/lib/mail/VumeEngine';

export const dynamic = 'force-dynamic';

/**
 * 🕒 CRON: NEW CUSTOMER FOLLOW-UP (2026)
 * 
 * Doel: Automatisch e-mails sturen naar nieuwe klanten, 7 dagen na hun eerste bestelling.
 * Volgens de legacy strategie: "Hoe was het met hun bestelling?"
 */
export async function GET() {
  try {
    console.log('🚀 Starting New Customer Follow-up Cron...');

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
      eq(orders.status, 'paid') // Alleen betaalde orders
    ));

    console.log(`🔍 Found ${recentOrders.length} potential orders from 7 days ago.`);

    let sentCount = 0;

    for (const order of recentOrders) {
      if (!order.userId) continue;

      // 3. Check of dit de EERSTE en ENIGE order is van deze klant (Nieuwe klant filter)
      const userOrders = await db.select({ count: count() })
        .from(orders)
        .where(eq(orders.userId, order.userId));
      
      const isNewCustomer = userOrders[0].count === 1;

      if (!isNewCustomer) {
        console.log(`⏭️ Skipping Order #${order.id}: Not a new customer.`);
        continue;
      }

      // 4. Check of we al een follow-up hebben gestuurd (Idempotency)
      const hasFollowUp = (order.rawMeta as any)?.followUpSent === true;
      if (hasFollowUp) {
        console.log(`⏭️ Skipping Order #${order.id}: Follow-up already sent.`);
        continue;
      }

      // 5. Haal user en actor details op voor de mail
      const [user] = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
      const [item] = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).limit(1);
      
      let actorName = 'onze stemacteur';
      if (item?.actorId) {
        const [actor] = await db.select().from(actors).where(eq(actors.id, item.actorId)).limit(1);
        if (actor) actorName = actor.firstName;
      }

      if (user?.email) {
        // 6. Verstuur de mail
        await VumeEngine.send({
          to: user.email,
          subject: `Hoe was je ervaring met ${actorName}?`,
          template: 'follow-up',
          context: {
            userName: user.firstName || 'Klant',
            orderId: order.id.toString(),
            actorName: actorName,
            language: 'nl'
          },
          host: 'www.voices.be'
        });

        // 7. Markeer als verzonden in de order meta
        await db.update(orders)
          .set({ 
            rawMeta: { ...(order.rawMeta as any), followUpSent: true } 
          })
          .where(eq(orders.id, order.id));

        console.log(`✅ Follow-up sent to ${user.email} for Order #${order.id}`);
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, processed: recentOrders.length, sent: sentCount });
  } catch (error: any) {
    console.error('❌ Follow-up Cron Failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
