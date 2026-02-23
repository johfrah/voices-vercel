import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { orderItems } from '@db/schema';
import { eq } from 'drizzle-orm';
import { PayoutReadinessService } from '@/lib/services/payout-readiness-service';

/**
 *  CLIENT APPROVAL API (NUCLEAR 2026)
 * 
 * Wordt aangeroepen wanneer een klant audio goedkeurt in het portaal.
 * Triggert direct de Payout Readiness check.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderItemId } = body;

    if (!orderItemId) {
      return NextResponse.json({ error: 'orderItemId is verplicht' }, { status: 400 });
    }

    console.log(` Klant keurt Order Item ${orderItemId} goed...`);

    // 1. Update de status in de database
    await db.update(orderItems)
      .set({ 
        deliveryStatus: 'approved'
      })
      .where(eq(orderItems.id, orderItemId));

    // 2. Trigger de Payout Readiness Service (De "Closed-Loop")
    const isReady = await PayoutReadinessService.getInstance().checkAndPreparePayout(orderItemId);

    return NextResponse.json({ 
      success: true, 
      status: 'approved',
      pontoReady: isReady 
    });

  } catch (error) {
    console.error(' Client Approval Error:', error);
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 });
  }
}
