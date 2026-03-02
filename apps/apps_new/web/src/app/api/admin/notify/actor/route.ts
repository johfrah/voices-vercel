import { NextRequest, NextResponse } from 'next/server';
import { VumeEngine } from '@/lib/mail/VumeEngine';
import { db } from '@/lib/system/voices-config';
import { actors, orders, users } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: NOTIFY ACTOR (ASSIGNMENT)
 * 
 * Verstuurt een officile opdrachtbevestiging naar de stemacteur.
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

    // 3. Haal klant details op
    const [customer] = await db.select().from(users).where(eq(users.id, order.user_id as number)).limit(1);

    const { MarketManagerServer: MarketManager } = require('@/lib/system/core/market-manager');
    const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
    const market = MarketManager.getCurrentMarket(host);
    const domains = MarketManager.getMarketDomains();
    const canonicalHost = domains[market.market_code]?.replace('https://', '') || (MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be');
    const finalHost = host || canonicalHost;

    // 4. Verstuur de mail via VUME
    await VumeEngine.send({
      to: actor.email,
      subject: `🎙️ Nieuwe Opdracht: #${order.displayOrderId || order.wpOrderId} - ${market.name}`,
      template: 'actor-assignment',
      context: {
        actorName: actor.first_name,
        orderId: order.displayOrderId || order.wpOrderId?.toString(),
        clientName: customer ? `${customer.first_name} ${customer.last_name}` : 'Klant',
        clientCompany: customer?.companyName,
        usageType: itemData?.usage || 'Voice-over',
        script: itemData?.script || 'Zie bijlage/dashboard',
        briefing: itemData?.briefing,
        deliveryTime: actor.deliveryTime || 'binnen 48 uur',
        language: 'nl-be' // Actors are mostly NL for now
      },
      host: finalHost
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [Notify Actor] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
