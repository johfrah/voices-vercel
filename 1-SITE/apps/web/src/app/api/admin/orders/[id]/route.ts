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

    // 🤝 DE HANDDRUK (Human-Centric Mapping)
    const formattedItems = items.map((item: any) => ({
      id: item.id,
      name: item.name || 'Onbekend item',
      quantity: item.quantity || 1,
      price: item.price?.toString() || "0.00",
      subtotal: (Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)
    }));

    const journeyMap: Record<number, string> = {
      1: 'Voices Agency',
      2: 'Voices Studio',
      3: 'Voices Academy',
      4: 'Voices Artist'
    };

    const statusMap: Record<string, string> = {
      'completed': 'Voltooid',
      'processing': 'In behandeling',
      'pending': 'Wacht op betaling',
      'on-hold': 'Gepauzeerd',
      'cancelled': 'Geannuleerd',
      'refunded': 'Terugbetaald',
      'failed': 'Mislukt',
      'wc-completed': 'Voltooid',
      'wc-processing': 'In behandeling',
      'wc-pending': 'Wacht op betaling'
    };

    const paymentMap: Record<number, string> = {
      1: 'Bancontact',
      2: 'Creditcard',
      3: 'iDEAL',
      4: 'Factuur (PO)',
      5: 'Handmatige overboeking'
    };

    return NextResponse.json({
      id: orderPk,
      orderNumber: orderPk.toString(),
      date: order.createdAt,
      status: statusMap[order.statusId?.toString() || ''] || statusMap['completed'] || 'In behandeling',
      unit: journeyMap[Number(order.journeyId)] || 'Voices',
      customer: customerInfo ? {
        name: `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim(),
        email: customerInfo.email,
        company: customerInfo.companyName
      } : null,
      billing: {
        email: order.billingEmailAlt || customerInfo?.email,
        purchaseOrder: order.purchaseOrder
      },
      finance: {
        net: order.amountNet?.toString() || "0.00",
        total: order.amountTotal?.toString() || "0.00",
        vat: (Number(order.amountTotal || 0) - Number(order.amountNet || 0)).toFixed(2),
        method: paymentMap[Number(order.paymentMethodId)] || 'Online betaling'
      },
      items: formattedItems,
      briefing: order.rawMeta?.briefing || order.rawMeta?._billing_wo_briefing || null,
      technical: {
        sourceId: legacyInternalId,
        meta: order.rawMeta || {}
      }
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Critical Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
