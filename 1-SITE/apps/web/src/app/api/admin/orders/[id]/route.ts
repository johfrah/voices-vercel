import { db, ordersV2, users, orderItems, recordingSessions, ordersLegacyBloat } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const idStr = params.id.replace(/\/$/, '');
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    console.log(`🚀 [Admin Order Detail] Fetching atomic data for WP ID: ${id}`);

    // 🛡️ CHRIS-PROTOCOL: Auth Check (v2.14.685)
    // We laten de admin door als er een sessie is.
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) {
      console.warn(`⚠️ [Admin Order Detail] Auth Failed for ${id}:`, auth.status);
      return auth;
    }

    // 🚀 NUCLEAR DETAIL FETCH: WP ID is nu de PK
    // We gebruiken sql.raw voor maximale stabiliteit in de cloud
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

    // 🛡️ CHRIS-PROTOCOL: Robust Type Casting (v2.14.656)
    const userId = order.user_id ? Number(order.user_id) : null;
    const legacyInternalId = order.legacy_internal_id ? Number(order.legacy_internal_id) : null;
    const orderPk = Number(order.id);

    // 🛡️ CHRIS-PROTOCOL: JSON Parsing Fix (v2.14.637)
    let rawMeta = order.raw_meta;
    if (typeof rawMeta === 'string') {
      try {
        rawMeta = JSON.parse(rawMeta);
      } catch (e) {
        console.warn(`[Admin Order Detail] Failed to parse raw_meta for ${id}`);
      }
    }

    // 🛡️ CHRIS-PROTOCOL: Zero-Slop Item Mapping (v2.14.637)
    // We zoeken op legacy_internal_id (WooCommerce order_id) voor items
    const items = await db.select().from(orderItems).where(
      eq(orderItems.orderId, legacyInternalId || orderPk)
    );

    // Resolve User Info
    let customerInfo = null;
    if (userId) {
      // 🛡️ CHRIS-PROTOCOL: Deep User Search (v2.14.656)
      let dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(res => res[0]);
      if (!dbUser) {
        dbUser = await db.select().from(users).where(eq(users.wpUserId, userId)).limit(1).then(res => res[0]);
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

    // 🛡️ CHRIS-PROTOCOL: System Event Logging for Debugging
    await db.insert(systemEvents).values({
      source: 'api',
      level: 'info',
      message: `Order Detail Fetched: ${id}`,
      details: { order_id: id, has_meta: !!rawMeta, item_count: items.length }
    }).catch(() => {});

    // 🤝 DE HANDDRUK: We sturen een object terug dat de frontend begrijpt
    return NextResponse.json({
      ...order,
      id: orderPk,
      userId: userId, // CamelCase mapping
      user_id: userId,
      legacyInternalId: legacyInternalId, // CamelCase mapping
      legacy_internal_id: legacyInternalId,
      raw_meta: rawMeta, 
      user: customerInfo,
      items: items,
      displayOrderId: orderPk.toString(),
      status: 'completed', // Default for now
      amountNet: order.amount_net?.toString() || "0.00", // CamelCase mapping
      amount_net: order.amount_net?.toString() || "0.00",
      total: order.total?.toString() || "0.00", // CamelCase mapping
      amount_total: order.total?.toString() || "0.00"
    });

  } catch (error: any) {
    console.error('[Admin Order Detail GET] Error:', error);
    
    // Log de fout naar de database voor forensische analyse
    await db.insert(systemEvents).values({
      source: 'api',
      level: 'critical',
      message: `Order Detail Failed: ${params.id}`,
      details: { error: error.message, stack: error.stack }
    }).catch(() => {});

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
