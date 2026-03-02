import { db } from '@/lib/system/voices-config';
import { orders, users, orderItems, orderStatuses, ordersLegacyBloat } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 *  API: ADMIN ORDERS (2026)
 * 
 * Haalt bestellingen op voor de admin cockpit met paginering.
 * 🛡️ CHRIS-PROTOCOL: RESTORED STABLE v2.15.012 ARCHITECTURE
 */

function mapStatusToUiLabel(statusCode?: string | null, statusLabel?: string | null): string {
  switch (statusCode) {
    case 'completed_paid':
      return 'Betaald';
    case 'completed':
    case 'completed_unpaid':
      return 'In behandeling';
    case 'awaiting_payment':
    case 'unpaid':
    case 'waiting_po':
      return 'Wacht op betaling';
    case 'quote_sent':
      return 'Offerte';
    case 'failed':
    case 'refunded':
      return 'Mislukt';
    default:
      return statusLabel || 'In behandeling';
  }
}

function mapWorldToUnit(worldId?: number | null): string {
  switch (worldId) {
    case 1:
      return 'Agency';
    case 2:
      return 'Studio';
    case 3:
      return 'Academy';
    case 5:
      return 'Portfolio';
    case 6:
      return 'Ademing';
    case 7:
      return 'Freelance';
    case 8:
      return 'Partner';
    case 10:
      return 'Johfrai';
    case 25:
      return 'Artist';
    default:
      return 'Voices';
  }
}

export async function GET(request: NextRequest) {
  try {
    // 🛡️ CHRIS-PROTOCOL: Auth Check
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '50');
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;
    const search = (searchParams.get('search') || '').trim();
    const worldCode = (searchParams.get('world') || '').trim(); // 🌍 Filter op World
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(sql`(CAST(id AS TEXT) ILIKE ${searchTerm} OR billing_email_alt ILIKE ${searchTerm})`);
    }

    if (worldCode) {
      conditions.push(sql`world_id = (SELECT id FROM worlds WHERE code = ${worldCode} LIMIT 1)`);
    }

    const whereSql = conditions.length > 0
      ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
      : sql``;

    const countResult = await db.execute(sql`
      SELECT count(*)::int as value
      FROM orders_v2
      ${whereSql}
    `);
    const countRows: any = Array.isArray(countResult) ? countResult : (countResult.rows || []);
    const totalInDb = countRows[0] ? Number(countRows[0].value || countRows[0].count || 0) : 0;

    let debugInfo: any = {
      version: '2.16.017',
      db_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      page,
      limit,
      offset,
      totalInDb,
      timestamp: new Date()
    };

    const rowsResult = await db.execute(sql`
      SELECT 
        id, user_id, world_id, journey_id, status_id, payment_method_id, 
        amount_net, amount_total, purchase_order, billing_email_alt, created_at, legacy_internal_id
      FROM orders_v2
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    const rows: any = Array.isArray(rowsResult) ? rowsResult : (rowsResult.rows || []);
    const statusRows = await db
      .select({
        id: orderStatuses.id,
        code: orderStatuses.code,
        label: orderStatuses.label
      })
      .from(orderStatuses) as Array<{ id: number; code: string | null; label: string | null }>;
    const statusById = new Map<number, { code: string | null; label: string | null }>(
      statusRows.map((status: { id: number; code: string | null; label: string | null }) => [Number(status.id), status])
    );

    debugInfo.source = 'hybrid_sql.orders';
    debugInfo.fetchedCount = rows.length;

    const sanitizedOrders = await Promise.all(rows.map(async (order: any) => {
      try {
        const defaultDomain = MarketManager.getMarketDomains()['BE']?.replace('https://www.', '') || ['voices', 'be'].join('.');
        let customerInfo = {
          first_name: "Guest",
          last_name: "",
          email: `guest@${defaultDomain}`,
          companyName: ""
        };

        const userId = order.user_id;
        let dbUser = null;

        if (userId) {
          try {
            dbUser = await db.select().from(users).where(eq(users.id, userId)).limit(1).then((res: any[]) => res[0]);
            if (!dbUser && userId > 1000) {
              dbUser = await db.select().from(users).where(eq(users.wpUserId, userId)).limit(1).then((res: any[]) => res[0]);
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
                dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then((res: any[]) => res[0]);
                if (!dbUser) {
                  const [newUser] = await db.insert(users).values({
                    email: email,
                    first_name: meta.billing?.first_name || meta._billing_first_name || "Guest",
                    last_name: meta.billing?.last_name || meta._billing_last_name || "",
                    companyName: meta.billing?.company || meta._billing_company || "",
                    wpUserId: Number.isFinite(Number(userId)) ? Number(userId) : null,
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

        const statusMeta = statusById.get(Number(order.status_id));
        const statusCode = statusMeta?.code || null;
        const statusLabel = statusMeta?.label || null;
        const statusForUi = mapStatusToUiLabel(statusCode, statusLabel);

        const orderPk = Number(order.id);
        const detailOrderId = Number(order.legacy_internal_id || orderPk);
        let itemsCount = 0;
        try {
          const itemCountResult = await db.execute(sql`
            SELECT count(*)::int as value
            FROM order_items
            WHERE order_id = ${detailOrderId}
          `);
          const itemCountRows: any = Array.isArray(itemCountResult) ? itemCountResult : (itemCountResult.rows || []);
          itemsCount = Number(itemCountRows[0]?.value || 0);
        } catch {
          itemsCount = 0;
        }

        const customerName = `${customerInfo.first_name || ''} ${customerInfo.last_name || ''}`.trim();
        const totalAmount = Number(order.amount_total || 0);

        return {
          id: orderPk,
          orderNumber: String(orderPk),
          date: order.created_at,
          status: statusForUi,
          unit: mapWorldToUnit(Number(order.world_id)),
          customer: {
            name: customerName || 'Onbekende Klant',
            email: customerInfo.email,
            company: customerInfo.companyName || null,
          },
          total: Number.isFinite(totalAmount) ? totalAmount : 0,
          currency: 'EUR',
          itemsCount,

          // Legacy compatibility for older admin consumers
          wpOrderId: orderPk,
          displayOrderId: String(orderPk),
          amountNet: order.amount_net?.toString() || "0.00",
          purchaseOrder: order.purchase_order || null,
          billingEmailAlt: order.billing_email_alt || null,
          journey: 'agency', // Default for now
          worldId: order.world_id,
          journeyId: order.journey_id,
          statusId: order.status_id,
          statusCode,
          statusLabel,
          paymentMethodId: order.payment_method_id,
          createdAt: order.created_at,
          isQuote: statusCode === 'quote_sent',
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
