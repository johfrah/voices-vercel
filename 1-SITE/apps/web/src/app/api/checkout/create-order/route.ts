import { NextRequest, NextResponse } from 'next/server';
import { db, orders, orderItems, orderNotes } from '@/lib/system/db';
import { MollieService } from '@/lib/payments/mollie';

/**
 *  HEADLESS CHECKOUT API - V2 (NUCLEAR)
 * 
 * Doel: Volledige order-creatie inclusief line items en Mollie betaling.
 * Geen WordPress, 100% Native Engine.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, total, journey, iapContext, market = 'BE' } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    //  ATOMIC TRANSACTION: Order + Items + Notes
    const result = await db.transaction(async (tx) => {
      // 1. Maak de Master Order aan
      const [order] = await tx.insert(orders).values({
        userId,
        total: total.toString(),
        status: 'pending',
        journey: journey || 'agency',
        market: market,
        iapContext: iapContext || {},
        createdAt: new Date()
      }).returning();

      // 2. Maak de Order Items aan (Stemmen of Workshops)
      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          actorId: item.actorId, // Indien stem
          editionId: item.editionId, // Indien workshop
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price.toString(),
          metaData: item.metaData || {}, // Bevat script, usage, etc.
          createdAt: new Date()
        });
      }

      // 3. Initialiseer de betaling bij Mollie
      const molliePayment = await MollieService.createPayment({
        amount: {
          currency: 'EUR',
          value: parseFloat(total).toFixed(2)
        },
        description: `Voices.be Order #${order.id}`,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?orderId=${order.id}`,
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/webhook`, // Moet publiek bereikbaar zijn
        metadata: {
          orderId: order.id,
          userId: userId
        }
      });

      // 4. Log de transactie-start
      await tx.insert(orderNotes).values({
        orderId: order.id,
        note: `Betaling gestart via Mollie (ID: ${molliePayment.id})`,
        isCustomerNote: false
      });

      return { orderId: order.id, checkoutUrl: molliePayment._links.checkout.href };
    });

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      checkoutUrl: result.checkoutUrl
    });

  } catch (error) {
    console.error(' NUCLEAR CHECKOUT ERROR:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Checkout failed' 
    }, { status: 500 });
  }
}
