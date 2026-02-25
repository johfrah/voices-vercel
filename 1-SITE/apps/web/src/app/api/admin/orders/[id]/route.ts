import { db, ordersV2, users, orderItems, recordingSessions, ordersLegacyBloat } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    console.log(`🚀 [Admin Order Detail] Fetching atomic data for WP ID: ${id}`);

    // 🚀 NUCLEAR DETAIL FETCH: WP ID is nu de PK
    const rawResult = await db.execute(sql.raw(`
      SELECT 
        o.id, o.user_id, o.journey_id, o.status_id, o.payment_method_id,
        o.amount_net, o.amount_total as total, o.purchase_order, o.billing_email_alt,
        o.created_at, o.legacy_internal_id, b.raw_meta
      FROM orders_v2 o
      LEFT JOIN orders_legacy_bloat b ON o.id = b.wp_order_id
      WHERE o.id = ${id}
      LIMIT 1
    `));

    const rows: any = Array.isArray(rawResult) ? rawResult : (rawResult.rows || []);
    const order = rows[0];
    if (!order) {
      console.warn(`⚠️ [Admin Order Detail] Order ${id} not found in orders_v2`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 🛡️ CHRIS-PROTOCOL: JSON Parsing Fix (v2.14.637)
    // raw_meta kan als string of object binnenkomen afhankelijk van de driver
    let rawMeta = order.raw_meta;
    if (typeof rawMeta === 'string') {
      try {
        rawMeta = JSON.parse(rawMeta);
      } catch (e) {
        console.warn(`[Admin Order Detail] Failed to parse raw_meta for ${id}`);
      }
    }

    // 🛡️ CHRIS-PROTOCOL: Zero-Slop Item Mapping (v2.14.637)
    const items = await db.select().from(orderItems).where(
      eq(orderItems.orderId, order.legacy_internal_id || order.id)
    );

    // Resolve User Info
    let customerInfo = null;
    if (order.user_id) {
      let dbUser = await db.select().from(users).where(eq(users.id, order.user_id)).limit(1).then(res => res[0]);
      if (!dbUser && order.user_id > 1000) {
        dbUser = await db.select().from(users).where(eq(users.wpUserId, order.user_id)).limit(1).then(res => res[0]);
      }
      
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

    return NextResponse.json({
      ...order,
      raw_meta: rawMeta, // 🤝 De Handdruk: Altijd een object
      user: customerInfo,
      items: items,
      displayOrderId: order.id?.toString(),
      status: 'completed' // Default for now
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
