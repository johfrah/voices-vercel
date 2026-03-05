import { NextRequest, NextResponse } from 'next/server';
import { db, orders, orderItems, orderNotes } from '@/lib/system/voices-config';
import { MollieService } from '@/lib/payments/mollie';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';

/**
 *  HEADLESS CHECKOUT API - V2 (NUCLEAR)
 * 
 * Doel: Volledige order-creatie inclusief line items en Mollie betaling.
 * Geen WordPress, 100% eigen architectuur.
 */

const DEFAULT_WORLD_BY_JOURNEY: Record<string, number> = {
  agency: 1,
  studio: 2,
  academy: 3,
  portfolio: 5,
  ademing: 6,
  freelance: 7,
  partner: 8,
  johfrai: 10,
  artist: 25,
};

function normalizeJourneyAlias(value: unknown): string {
  const normalized = String(value || 'agency').trim().toLowerCase();
  if (!normalized) return 'agency';
  if (normalized === 'johfrai-subscription' || normalized === 'johfrai_subscription') return 'johfrai';
  if (normalized === 'partners') return 'partner';
  if (normalized.startsWith('agency_')) return 'agency';
  return normalized;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, total, journey, iapContext } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const host = request.headers.get('host') || 'www.voices.be';
    const marketConfig = MarketManager.getCurrentMarket(host);
    const isLocalHost = host.includes('localhost') || host.includes('127.0.0.1');
    const marketBaseUrl =
      MarketManager.getMarketDomains()[marketConfig.market_code] ||
      `https://${host}`;
    const baseUrl = isLocalHost ? `http://${host}` : marketBaseUrl;
    const normalizedJourney = normalizeJourneyAlias(journey || iapContext?.journey || 'agency');
    const resolvedWorldId = DEFAULT_WORLD_BY_JOURNEY[normalizedJourney] || DEFAULT_WORLD_BY_JOURNEY.agency;

    //  ATOMIC TRANSACTION: Order + Items + Notes
    const result = await db.transaction(async (tx) => {
      // 1. Maak de Master Order aan
      const [order] = await tx.insert(orders).values({
        userId,
        worldId: resolvedWorldId,
        total: total.toString(),
        status: 'pending',
        journey: normalizedJourney,
        market: marketConfig.market_code,
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
        description: `Voices Order #${order.id}`,
        redirectUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
        webhookUrl: `${baseUrl}/api/checkout/webhook`,
        metadata: {
          orderId: order.id,
          user_id: userId,
          journey: normalizedJourney,
          world_id: resolvedWorldId,
          market: marketConfig.market_code,
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
