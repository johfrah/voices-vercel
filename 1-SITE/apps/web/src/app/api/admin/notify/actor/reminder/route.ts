import { NextRequest, NextResponse } from 'next/server';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { db } from '@/lib/system/voices-config';
import { actors, orders, users } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: REMIND ACTOR (DEADLINE BREACH)
 * 
 * Verstuurt een reminder naar de stemacteur bij een (bijna) gemiste deadline.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { actorId, orderId, itemData } = body;

    if (!actorId || !orderId) {
      return NextResponse.json({ error: 'Actor ID and Order ID are required' }, { status: 400 });
    }

    // 1. Haal actor details op
    const [actor] = await db.select().from(actors).where(eq(actors.id, actorId)).limit(1);
    if (!actor || !actor.email) {
      return NextResponse.json({ error: 'Actor not found or has no email' }, { status: 404 });
    }

    // 2. Haal order details op
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const host = request.headers.get('host') || 'www.voices.be';
    const { MarketManagerServer: MarketManager } = require('@/lib/system/market-manager-server');
    const market = MarketManager.getCurrentMarket(host);
    const domains = MarketManager.getMarketDomains();
    const canonicalHost = domains[market.market_code]?.replace('https://', '') || 'www.voices.be';
    const finalHost = host || canonicalHost;

    // 3. Verstuur de reminder via VUME
    await VumeEngine.send({
      to: actor.email,
      subject: `⚠️ Reminder: Deadline voor #${order.displayOrderId || order.wpOrderId} - ${market.name}`,
      template: 'actor-reminder',
      context: {
        actorName: actor.first_name,
        orderId: order.displayOrderId || order.wpOrderId?.toString(),
        usageType: itemData?.usage || 'Voice-over',
        deliveryTime: actor.deliveryTime || 'binnen 48 uur',
        isOverdue: true,
        language: 'nl-be'
      },
      host: finalHost
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [Remind Actor] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
