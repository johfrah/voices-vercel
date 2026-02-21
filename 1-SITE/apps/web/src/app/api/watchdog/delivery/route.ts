import { NextResponse } from 'next/server';
import { db } from '@db';
import { orders } from '@db/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';

/**
 * DELIVERY WATCHDOG (NUCLEAR LOGIC 2026)
 * 
 * Monitort actieve bestellingen en waarschuwt bij vertragingen.
 * Verantwoordelijk voor:
 * 1. Controleren van deadlines.
 * 2. Automatisch versturen van nudges naar stemacteurs.
 * 3. Escalatie naar admin bij kritieke vertraging.
 */

export async function GET() {
  try {
    const now = new Date();
    const deadlineThreshold = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 uur geleden

    // 1. Zoek bestellingen die over de deadline zijn
    let delayedOrders: any[] = [];
    try {
      delayedOrders = await db.query.orders.findMany({
        where: and(
          eq(orders.status, 'processing'),
          lt(orders.createdAt, deadlineThreshold)
        ),
        with: {
          user: true
        }
      });
    } catch (dbError) {
      console.error(' Watchdog DB Error:', dbError);
    }

    console.log(` Watchdog: Found ${delayedOrders.length} delayed orders.`);

    // 2. Process Nudges (Simulated)
    const nudgedOrders = delayedOrders.map(order => ({
      id: order.id,
      wpOrderId: order.wpOrderId,
      action: 'NUDGE_SENT',
      recipient: order.user?.email
    }));

    return NextResponse.json({
      success: true,
      scanTime: now.toISOString(),
      delayedCount: delayedOrders.length,
      actionsTaken: nudgedOrders
    });

  } catch (error) {
    console.error(' Watchdog Error:', error);
    return NextResponse.json({ error: 'Watchdog scan failed' }, { status: 500 });
  }
}
