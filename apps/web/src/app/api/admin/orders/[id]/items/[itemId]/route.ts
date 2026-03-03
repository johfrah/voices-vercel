import { requireAdmin } from '@/lib/auth/api-auth';
import { db, orderItems, orderNotes, ordersV2 } from '@/lib/system/voices-config';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const orderId = Number(String(params.id || '').replace(/\/$/, ''));
  const itemId = Number(String(params.itemId || '').replace(/\/$/, ''));

  if (!Number.isFinite(orderId) || !Number.isFinite(itemId)) {
    return NextResponse.json({ error: 'Invalid order or item id' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const updates: Record<string, any> = {};
    if (typeof body.delivery_status === 'string' && body.delivery_status.trim()) {
      updates.deliveryStatus = body.delivery_status.trim();
    }
    if (typeof body.payout_status === 'string' && body.payout_status.trim()) {
      updates.payoutStatus = body.payout_status.trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, 'delivery_file_url')) {
      updates.deliveryFileUrl = body.delivery_file_url || null;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'invoice_file_url')) {
      updates.invoiceFileUrl = body.invoice_file_url || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    const v2Rows = await db
      .select({
        id: ordersV2.id,
        legacyInternalId: ordersV2.legacyInternalId,
      })
      .from(ordersV2)
      .where(eq(ordersV2.id, orderId))
      .limit(1);
    const v2Order = v2Rows[0];
    if (!v2Order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const sourceOrderId = v2Order.legacyInternalId ? Number(v2Order.legacyInternalId) : Number(v2Order.id);

    await db
      .update(orderItems)
      .set(updates)
      .where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, sourceOrderId)));

    const updatedRows = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        deliveryStatus: orderItems.deliveryStatus,
        payoutStatus: orderItems.payoutStatus,
        deliveryFileUrl: orderItems.deliveryFileUrl,
        invoiceFileUrl: orderItems.invoiceFileUrl,
      })
      .from(orderItems)
      .where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, sourceOrderId)))
      .limit(1);

    const updatedItem = updatedRows[0];
    if (!updatedItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    await db.insert(orderNotes).values({
      orderId: sourceOrderId,
      note: `Item #${itemId} bijgewerkt (delivery: ${updatedItem.deliveryStatus || '-'}, payout: ${updatedItem.payoutStatus || '-'})`,
      isCustomerNote: false,
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update order item' }, { status: 500 });
  }
}
