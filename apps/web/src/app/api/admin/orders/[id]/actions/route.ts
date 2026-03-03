import { requireAdmin } from '@/lib/auth/api-auth';
import { MollieService } from '@/lib/payments/mollie';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';
import { db, orderNotes, orderStatuses, orders, ordersV2, users } from '@/lib/system/voices-config';
import { eq, inArray } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function mapStatusToLegacyStatus(code: string): string {
  const normalized = String(code || '').toLowerCase();
  if (['completed', 'completed_paid', 'paid', 'wc-completed'].includes(normalized)) return 'completed';
  if (['quote_sent', 'quote_pending', 'quote-pending'].includes(normalized)) return 'quote-pending';
  if (['failed'].includes(normalized)) return 'failed';
  if (['cancelled'].includes(normalized)) return 'cancelled';
  if (['refunded', 'wc-refunded'].includes(normalized)) return 'refunded';
  if (['waiting_po', 'awaiting_payment', 'unpaid', 'pending', 'wc-pending'].includes(normalized)) return 'pending';
  return 'processing';
}

type ActionName = 'request_po' | 'mark_in_production' | 'mark_delivered' | 'generate_payment_link';

async function syncStatusForOrder(args: {
  v2OrderId: number;
  legacyOrderId: number | null;
  statusCandidates: string[];
  note?: string;
}) {
  const { v2OrderId, legacyOrderId, statusCandidates, note } = args;
  const statusRows = await db
    .select({ id: orderStatuses.id, code: orderStatuses.code })
    .from(orderStatuses)
    .where(inArray(orderStatuses.code, statusCandidates));
  const statusRow = statusCandidates
    .map((candidate) => statusRows.find((row: any) => row.code === candidate))
    .find(Boolean);

  if (!statusRow) {
    throw new Error(`No status found for candidates: ${statusCandidates.join(', ')}`);
  }

  await db.update(ordersV2).set({ statusId: statusRow.id }).where(eq(ordersV2.id, v2OrderId));

  if (legacyOrderId) {
    const legacyStatus = mapStatusToLegacyStatus(statusRow.code || statusCandidates[0] || 'pending');
    await db.update(orders).set({ status: legacyStatus }).where(eq(orders.id, legacyOrderId));

    if (note) {
      await db.insert(orderNotes).values({
        orderId: legacyOrderId,
        note,
        isCustomerNote: false,
      });
    }
  }

  return statusRow.code || statusCandidates[0] || null;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const id = Number(String(params.id || '').replace(/\/$/, ''));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid order id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || '').trim() as ActionName;
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const orderRows = await db
      .select({
        v2Id: ordersV2.id,
        userId: ordersV2.userId,
        amountTotal: ordersV2.amountTotal,
        legacyInternalId: ordersV2.legacyInternalId,
        legacyOrderId: orders.id,
        legacyWpOrderId: orders.wpOrderId,
        legacyTotal: orders.total,
        rawMeta: orders.rawMeta,
        email: users.email,
      })
      .from(ordersV2)
      .leftJoin(orders, eq(orders.id, ordersV2.legacyInternalId))
      .leftJoin(users, eq(users.id, ordersV2.userId))
      .where(eq(ordersV2.id, id))
      .limit(1);

    const orderRow = orderRows[0];
    if (!orderRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const legacyOrderId = orderRow.legacyOrderId ? Number(orderRow.legacyOrderId) : null;

    if (action === 'request_po') {
      const statusCode = await syncStatusForOrder({
        v2OrderId: id,
        legacyOrderId,
        statusCandidates: ['waiting_po', 'awaiting_payment', 'pending'],
        note: 'PO opgevraagd door admin.',
      });
      return NextResponse.json({ success: true, action, statusCode });
    }

    if (action === 'mark_in_production') {
      const statusCode = await syncStatusForOrder({
        v2OrderId: id,
        legacyOrderId,
        statusCandidates: ['awaiting_payment', 'waiting_po', 'unpaid'],
        note: 'Productie gestart: order in actieve opvolging.',
      });
      return NextResponse.json({ success: true, action, statusCode });
    }

    if (action === 'mark_delivered') {
      const statusCode = await syncStatusForOrder({
        v2OrderId: id,
        legacyOrderId,
        statusCandidates: ['completed_unpaid', 'completed'],
        note: 'Order gemarkeerd als verzonden naar klant.',
      });
      return NextResponse.json({ success: true, action, statusCode });
    }

    if (action === 'generate_payment_link') {
      if (!legacyOrderId) {
        return NextResponse.json({ error: 'No linked legacy order found' }, { status: 400 });
      }

      const host = request.headers.get('host') || MarketManager.getMarketDomains()['BE']?.replace('https://', '');
      const market = MarketManager.getCurrentMarket(host || 'www.voices.be');
      const siteUrl =
        MarketManager.getMarketDomains()[market.market_code] ||
        `https://${host || MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be'}`;

      const amountValue = Number(orderRow.amountTotal || orderRow.legacyTotal || 0);
      if (!(amountValue > 0)) {
        return NextResponse.json({ error: 'Order amount is invalid for payment link' }, { status: 400 });
      }

      const rawMeta: any = orderRow.rawMeta || {};
      const email = orderRow.email || rawMeta?._billing_email || rawMeta?.customer?.email || null;
      const token = sign(
        { userId: orderRow.userId || null, orderId: legacyOrderId, email },
        process.env.JWT_SECRET || 'voices-secret-2026',
        { expiresIn: '24h' }
      );

      const payment = await MollieService.createPayment({
        amount: {
          currency: 'EUR',
          value: amountValue.toFixed(2),
        },
        description: `Voices Order #${id}`,
        redirectUrl: `${siteUrl}/api/auth/magic-login?token=${token}&redirect=/account/orders?orderId=${id}`,
        webhookUrl: `${siteUrl}/api/checkout/webhook`,
        metadata: {
          orderId: legacyOrderId,
          user_id: orderRow.userId || null,
          email,
        },
      });

      await syncStatusForOrder({
        v2OrderId: id,
        legacyOrderId,
        statusCandidates: ['awaiting_payment', 'pending', 'unpaid'],
        note: `Handmatige betaallink gegenereerd (${payment.id}).`,
      });

      return NextResponse.json({
        success: true,
        action,
        paymentId: payment.id,
        checkoutUrl: payment._links?.checkout?.href || null,
      });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Action failed' }, { status: 500 });
  }
}
