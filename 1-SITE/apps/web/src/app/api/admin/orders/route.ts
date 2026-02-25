import { db } from '@/lib/system/voices-config';
import { orders, users, notifications, orderItems, systemEvents } from '@/lib/system/voices-config';
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
 */

export async function GET(request: NextRequest) {
  // 🛡️ CHRIS-PROTOCOL: Bypass Auth for Debugging (v2.14.603)
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  try {
    // 🛡️ CHRIS-PROTOCOL: 1 TRUTH MANDATE (v2.14.603)
    // We halen eerst het totaal aantal orders op voor de paginering UI
    const [totalCountResult] = await db.select({ value: count() }).from(orders).catch((err: any) => {
      console.error('[Admin Orders GET] Count query failed:', err);
      // 🛡️ CHRIS-PROTOCOL: Fallback to direct SQL if Drizzle fails (v2.14.603)
      return db.execute(sql`SELECT count(*) as value FROM orders`).then((res: any) => {
        const rows = res.rows || res;
        return [{ value: rows[0]?.value || 0 }];
      }).catch(() => [{ value: 0 }]);
    });
    const totalInDb = Number(totalCountResult?.value || 0);

    let allOrders: any[] = [];
    let debugInfo: any = {
      version: 'v2.14.603',
      db_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      page,
      limit,
      offset,
      totalInDb,
      timestamp: new Date().toISOString()
    };

    try {
      // 🚀 NUCLEAR PAGINATION: Direct SQL voor snelheid en stabiliteit
      // We proberen het ZONDER public. prefix om te zien of dat het probleem is op Vercel
      const rawResult = await db.execute(sql`
        SELECT * FROM orders 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `);
      allOrders = rawResult.rows || rawResult || [];
      debugInfo.source = 'raw.orders';
    } catch (rawErr: any) {
      debugInfo.raw_error = rawErr.message;
      // Fallback naar Drizzle
      allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
      debugInfo.source = 'drizzle.orders';
    }

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
        if (userId) {
          try {
            const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (dbUser) {
              customerInfo = {
                first_name: dbUser.first_name || "",
                last_name: dbUser.last_name || "",
                email: dbUser.email || `unknown@${defaultDomain}`,
                companyName: dbUser.companyName || ""
              };
            }
          } catch (e) {}
        }

        const rawMeta = order.raw_meta || order.rawMeta;
        if (customerInfo.first_name === "Guest" && rawMeta) {
          try {
            const meta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : rawMeta;
            if (meta.billing) {
              customerInfo = {
                first_name: meta.billing.first_name || customerInfo.first_name,
                last_name: meta.billing.last_name || customerInfo.last_name,
                email: meta.billing.email || customerInfo.email,
                companyName: meta.billing.company || customerInfo.companyName
              };
            }
          } catch (e) {}
        }

        return {
          id: order.id,
          wpOrderId: order.wp_order_id || order.wpOrderId,
          displayOrderId: order.display_order_id || order.displayOrderId,
          total: order.total?.toString() || "0.00",
          status: order.status || 'pending',
          journey: order.journey || 'agency',
          market: order.market || 'BE',
          createdAt: order.created_at || order.createdAt,
          isQuote: !!(order.is_quote || order.isQuote),
          user: customerInfo
        };
      } catch (innerError) {
        return null;
      }
    }));

    const finalOrders = sanitizedOrders.filter(Boolean);

    return NextResponse.json({
      orders: finalOrders,
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
    }, { status: 200 });
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
