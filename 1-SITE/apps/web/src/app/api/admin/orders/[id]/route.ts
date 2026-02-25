import { db } from '@/lib/system/voices-config';
import { ordersV2, users, orderItems, recordingSessions } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/request';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // 🚀 NUCLEAR DETAIL FETCH: Direct SQL voor snelheid en de rugzak-koppeling
    const rawResult = await db.execute(sql`
      SELECT 
        o.id, o.wp_order_id, o.user_id, o.journey_id, o.status_id, o.payment_method_id,
        o.amount_net, o.amount_total as total, o.purchase_order, o.billing_email_alt,
        o.created_at, b.raw_meta
      FROM orders_v2 o
      LEFT JOIN orders_legacy_bloat b ON o.legacy_bloat_id = b.id
      WHERE o.id = ${id}
      LIMIT 1
    `);

    const order = rawResult.rows?.[0] || rawResult[0];
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Resolve User Info
    let customerInfo = null;
    if (order.user_id) {
      const [dbUser] = await db.select().from(users).where(eq(users.id, order.user_id)).limit(1);
      if (dbUser) {
        customerInfo = {
          id: dbUser.id,
          first_name: dbUser.first_name,
          last_name: dbUser.last_name,
          email: dbUser.email,
          companyName: dbUser.companyName,
          phone: dbUser.phone,
          addressStreet: dbUser.addressStreet,
          addressCity: dbUser.addressCity,
          addressZip: dbUser.addressZip,
          addressCountry: dbUser.addressCountry,
          vatNumber: dbUser.vatNumber
        };
      }
    }

    // Resolve Items
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

    return NextResponse.json({
      ...order,
      user: customerInfo,
      items: items,
      displayOrderId: order.wp_order_id?.toString(),
      status: 'completed' // Default for now
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
