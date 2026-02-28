import { db } from '@/lib/system/voices-config';
import { orders, users, notifications, orderItems, systemEvents, ordersV2, orderStatuses, ordersLegacyBloat } from '@/lib/system/voices-config';
import { desc, eq, sql, count } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 *  API: ADMIN ORDERS (2026)
 * 
 * Haalt bestellingen op voor de admin cockpit met paginering.
 * 🛡️ CHRIS-PROTOCOL: RESTORED STABLE v2.15.012 ARCHITECTURE
 */

export async function GET(request: NextRequest) {
  try {
    // 🛡️ CHRIS-PROTOCOL: Auth Check
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    // 🛡️ CHRIS-PROTOCOL: 1 TRUTH MANDATE (v2.14.638)
    // NUCLEAR: We gebruiken db.execute met sql.raw om Drizzle abstractie volledig te passeren
    let whereClause = '';
    if (search) {
      whereClause = `WHERE id::text ILIKE '%' || $1 || '%' OR billing_email_alt ILIKE '%' || $1 || '%'`;
    }

    const countResult = await db.execute(sql.raw(`SELECT count(*) as value FROM orders_v2 ${whereClause.replace('$1', search ? \`'\${search}'\` : '')}`));
    const countRows: any = Array.isArray(countResult) ? countResult : (countResult.rows || []);
    const totalInDb = countRows[0] ? Number(countRows[0].value || countRows[0].count || 0) : 0;

    let debugInfo: any = {
      version: '2.15.028',
      db_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      page,
      limit,
      offset,
      totalInDb,
      timestamp: new Date().toISOString()
    };

    // 🚀 NUCLEAR RAW SQL FETCH (v2.14.652)
    const rowsResult = await db.execute(sql.raw(`
      SELECT 
        id, user_id, world_id, journey_id, status_id, payment_method_id, 
        amount_net, amount_total, purchase_order, billing_email_alt, created_at
      FROM orders_v2
      ${whereClause.replace('$1', search ? \`'\${search}'\` : '')}
      ORDER BY created_at DESC
      LIMIT \${limit}
      OFFSET \${offset}
    `));

    const rows: any = Array.isArray(rowsResult) ? rowsResult : (rowsResult.rows || []);
    
    const allOrders = rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      worldId: row.world_id,
      journeyId: row.journey_id,
      statusId: row.status_id,
      paymentMethodId: row.payment_method_id,
      amountNet: row.amount_net,
      amountTotal: row.amount_total,
      purchaseOrder: row.purchase_order,
      billingEmailAlt: row.billing_email_alt,
      createdAt: row.created_at
    }));
    
    debugInfo.source = 'hybrid_sql.orders_v2';
    debugInfo.fetchedCount = allOrders.length;

    // 🕵️ GUEST & USER RESOLVER
    const sanitizedOrders = await Promise.all(allOrders.map(async (order) => {
      try {
        const defaultDomain = MarketManager.getMarketDomains()['BE']?.replace('https://www.', '') || ['voices', 'be'].join('.');
        let customerInfo = {
          first_name: "Guest",
          last_name: "",
          email: `guest@${defaultDomain}`,
          companyName: ""
        };

        const userId = order.user_id || order.userId;
        let dbUser = null;

        if (userId) {
          try {
            dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(res => res[0]);
            if (!dbUser && userId > 1000) {
              dbUser = await db.select().from(users).where(eq(users.wpUserId, userId)).limit(1).then(res => res[0]);
            }
          } catch (e) {}
        }

        if (!dbUser) {
          try {
            const [bloat] = await db.select().from(ordersLegacyBloat).where(eq(ordersLegacyBloat.wpOrderId, order.id)).limit(1);
            const rawMeta = bloat?.rawMeta;

            if (rawMeta) {
              const meta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : rawMeta;
              const email = meta.billing?.email || meta._billing_email;
              
              if (email) {
                dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0]);
                if (!dbUser) {
                  const [newUser] = await db.insert(users).values({
                    email: email,
                    first_name: meta.billing?.first_name || meta._billing_first_name || "Guest",
                    last_name: meta.billing?.last_name || meta._billing_last_name || "",
                    companyName: meta.billing?.company || meta._billing_company || "",
                    wpUserId: userId || null,
                    role: 'guest',
                    createdAt: new Date()
                  }).returning();
                  dbUser = newUser;
                }
              }
            }
          } catch (e) {}
        }

        if (dbUser) {
          customerInfo = {
            first_name: dbUser.first_name || "",
            last_name: dbUser.last_name || "",
            email: dbUser.email || `unknown@${defaultDomain}`,
            companyName: dbUser.companyName || ""
          };
        }

        let displayStatus = 'completed';
        if (order.status_id) {
          const [statusRow] = await db.select().from(orderStatuses).where(eq(orderStatuses.id, order.status_id)).limit(1);
          if (statusRow) displayStatus = statusRow.code;
        }

        // 🤝 DE HANDDRUK: Return structure matching v2.14.714 frontend
        return {
          id: order.id,
          wpOrderId: order.id,
          displayOrderId: order.id?.toString(),
          total: order.amountTotal?.toString() || "0.00",
          amountNet: order.amountNet?.toString() || "0.00",
          purchaseOrder: order.purchaseOrder || null,
          billingEmailAlt: order.billingEmailAlt || null,
          status: displayStatus, 
          journey: 'agency', // Default for now
          worldId: order.worldId,
          journeyId: order.journeyId,
          statusId: order.statusId,
          paymentMethodId: order.paymentMethodId,
          createdAt: order.createdAt,
          isQuote: false,
          user: customerInfo
        };
      } catch (innerError) {
        return null;
      }
    }));

    return NextResponse.json({
      orders: sanitizedOrders.filter(Boolean),
      pagination: {
        page,
        limit,
        totalInDb,
        totalPages: Math.ceil(totalInDb / limit)
      },
      _debug: debugInfo
    });
  } catch (error: any) {
    console.error('[Admin Orders GET Critical Error]:', error);
    return NextResponse.json({
      orders: [],
      _error: error.message
    }, { status: 500 });
  }
}

/**
 *  API: CREATE MANUAL ORDER (2026)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { userId, journey, items, internalNotes, syncToYuki, status } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const total = items.reduce((acc: number, item: any) => acc + (parseFloat(item.price) * item.quantity), 0);
    const totalTax = total * 0.21;
    
    const [newOrder] = await db.insert(orders).values({
      userId,
      journey,
      total: total.toString(),
      totalTax: totalTax.toString(),
      status: status || 'pending',
      internalNotes,
      is_manually_edited: true,
      market: 'BE',
      createdAt: new Date(),
    }).returning();

    const orderItemsToInsert = items.map((item: any) => ({
      orderId: newOrder.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price.toString(),
      createdAt: new Date(),
      is_manually_edited: true,
    }));

    await db.insert(orderItems).values(orderItemsToInsert);

    return NextResponse.json(newOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
