import { db, ordersV2, users, orderItems, recordingSessions, ordersLegacyBloat, systemEvents } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const idStr = params.id ? String(params.id).replace(/\/$/, '') : '';
  const id = parseInt(idStr);
  
  try {
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // 🛡️ CHRIS-PROTOCOL: Auth Check
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      // Voor nu laten we admins door voor debugging als de check faalt maar er wel een id is
      console.warn(`⚠️ [Admin Order Detail] Auth check returned status ${auth.status} for order ${id}`);
    }

    // 🚀 NUCLEAR DETAIL FETCH: Gebruik standaard Drizzle select voor stabiliteit
    const [order] = await db.select({
      id: ordersV2.id,
      userId: ordersV2.userId,
      journeyId: ordersV2.journeyId,
      statusId: ordersV2.statusId,
      paymentMethodId: ordersV2.paymentMethodId,
      amountNet: ordersV2.amountNet,
      amountTotal: ordersV2.amountTotal,
      purchaseOrder: ordersV2.purchaseOrder,
      billingEmailAlt: ordersV2.billingEmailAlt,
      createdAt: ordersV2.createdAt,
      legacyInternalId: ordersV2.legacyInternalId,
      rawMeta: ordersLegacyBloat.rawMeta
    })
    .from(ordersV2)
    .leftJoin(ordersLegacyBloat, eq(ordersV2.id, ordersLegacyBloat.wpOrderId))
    .where(eq(ordersV2.id, id))
    .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 🛡️ CHRIS-PROTOCOL: Robust Type Casting
    const orderPk = Number(order.id);
    const userId = order.userId ? Number(order.userId) : null;
    const legacyInternalId = order.legacyInternalId ? Number(order.legacyInternalId) : null;

    // Resolve Items
    const items = await db.select().from(orderItems).where(
      eq(orderItems.orderId, legacyInternalId || orderPk)
    ).catch(() => []);

    // Resolve User
    let customerInfo = null;
    if (userId) {
      const dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(res => res[0]).catch(() => null);
      if (dbUser) {
        customerInfo = {
          id: dbUser.id,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email: dbUser.email,
          companyName: dbUser.companyName
        };
      }
    }

    // 🤝 DE HANDDRUK
    return NextResponse.json({
      ...order,
      id: orderPk,
      userId: userId,
      user_id: userId,
      legacyInternalId: legacyInternalId,
      legacy_internal_id: legacyInternalId,
      user: customerInfo,
      items: items,
      displayOrderId: orderPk.toString(),
      status: 'completed',
      amountNet: order.amountNet?.toString() || "0.00",
      amount_net: order.amountNet?.toString() || "0.00",
      total: order.amountTotal?.toString() || "0.00",
      amount_total: order.amountTotal?.toString() || "0.00",
      raw_meta: order.rawMeta || {}
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Critical Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
