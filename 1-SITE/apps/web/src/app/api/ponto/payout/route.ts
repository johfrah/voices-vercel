import { NextRequest, NextResponse } from 'next/server';
import { PontoBridge, PayoutRecipient } from '@/lib/payments/ponto-bridge';
import { db } from '@db';
import { systemEvents } from '@db/schema';

/**
 *  PONTO PAYOUT API (GODMODE)
 * 
 * Doel: Het initiren van bulk-betalingen naar stemacteurs op basis van 
 * goedgekeurde Yuki-facturen.
 */

export async function GET() {
  try {
    const pending = await PontoBridge.getPendingPayouts();
    return NextResponse.json(pending);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pending payouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: 'Array of orderIds required' }, { status: 400 });
    }

    // 1. Haal de specifieke data op voor deze orders
    const allPending = await PontoBridge.getPendingPayouts();
    const recipients: PayoutRecipient[] = allPending
      .filter(p => orderIds.includes(p.orderId))
      .map(p => ({
        iban: p.iban,
        name: p.name,
        amount: p.amount,
        reference: p.reference
      }));

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found for these orders' }, { status: 404 });
    }

    // 2. Start de Ponto Bulk Payment
    const result = await PontoBridge.createBulkPayment(recipients);

    // 3. Log het resultaat
    await db.insert(systemEvents).values({
      source: 'api/ponto/payout',
      level: 'info',
      message: `Ponto payout initiated for ${recipients.length} orders.`,
      details: { paymentRequestId: result.paymentRequestId, orderIds }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Ponto API Error]:', error);
    return NextResponse.json({ error: 'Failed to initiate payout' }, { status: 500 });
  }
}
