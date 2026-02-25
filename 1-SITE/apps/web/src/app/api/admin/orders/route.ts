import { db } from '@/lib/system/voices-config';
import { orders, users, notifications, orderItems, systemEvents, ordersV2 } from '@/lib/system/voices-config';
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
    // 🛡️ CHRIS-PROTOCOL: 1 TRUTH MANDATE (v2.14.631)
    // We halen eerst het totaal aantal orders op voor de paginering UI
    // NUCLEAR: We gebruiken nu de schone orders_v2 tabel
    const [totalCountResult] = await db.select({ value: count() }).from(ordersV2).catch((err: any) => {
      console.error('[Admin Orders GET] Count query failed:', err);
      // 🛡️ CHRIS-PROTOCOL: Fallback to direct SQL if Drizzle fails (v2.14.631)
      return db.execute(sql`SELECT count(*) as value FROM orders_v2`).then((res: any) => {
        const rows = res.rows || res;
        return [{ value: rows[0]?.value || 0 }];
      }).catch(() => [{ value: 0 }]);
    });
    const totalInDb = Number(totalCountResult?.value || 0);

    let allOrders: any[] = [];
    let debugInfo: any = {
      version: 'v2.14.631',
      db_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      page,
      limit,
      offset,
      totalInDb,
      timestamp: new Date().toISOString()
    };

    try {
      // 🚀 NUCLEAR PAGINATION: WP ID is nu de PK (id)
      // We gebruiken de schone orders_v2 tabel (Zero-Slop)
      const rawResult = await db.execute(sql`
        SELECT 
          id, user_id, journey_id, status_id, payment_method_id,
          amount_net, amount_total as total, purchase_order, billing_email_alt,
          created_at
        FROM orders_v2 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `);
      allOrders = rawResult.rows || rawResult || [];
      debugInfo.source = 'raw.orders_v2';
    } catch (rawErr: any) {
      debugInfo.raw_error = rawErr.message;
      // Fallback naar Drizzle
      allOrders = await db.select().from(ordersV2).orderBy(desc(ordersV2.createdAt)).limit(limit).offset(offset);
      debugInfo.source = 'drizzle.orders_v2';
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

        // 🛡️ CHRIS-PROTOCOL: User Resolution Fix (v2.14.628)
        // We moeten zowel wp_user_id als het interne user_id checken
        // 🛡️ CHRIS-PROTOCOL: User Resolution & Silent Creation (v2.14.630)
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

        // 🚀 SILENT USER CREATION: Als er geen user is, maar we hebben wel de rugzak (voor email)
        if (!dbUser) {
          try {
            // Haal de rugzak op als we die niet hebben
            const [bloat] = await db.select().from(ordersLegacyBloat).where(eq(ordersLegacyBloat.wpOrderId, order.id)).limit(1);
            const rawMeta = bloat?.rawMeta;

            if (rawMeta) {
              const meta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : rawMeta;
              const email = meta.billing?.email || meta._billing_email;
              
              if (email) {
                // Check of de user stiekem al bestaat op email
                dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0]);
                
                if (!dbUser) {
                  // Maak de user silent aan (Nuclear Mode)
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
                  console.log(`👤 Silent User Created: ${email} for Order ${order.id}`);
                }
              }
            }
          } catch (e) {
            console.error(`❌ Silent User Creation Failed for Order ${order.id}:`, e);
          }
        }

        if (dbUser) {
          customerInfo = {
            first_name: dbUser.first_name || "",
            last_name: dbUser.last_name || "",
            email: dbUser.email || `unknown@${defaultDomain}`,
            companyName: dbUser.companyName || ""
          };
        }

        return {
          id: order.id,
          wpOrderId: order.id, // id IS nu het wp_order_id
          displayOrderId: order.id?.toString(),
          total: order.total?.toString() || "0.00",
          amountNet: order.amount_net?.toString() || order.amountNet?.toString() || "0.00",
          purchaseOrder: order.purchase_order || order.purchaseOrder || null,
          billingEmailAlt: order.billing_email_alt || order.billingEmailAlt || null,
          status: order.status || 'completed', 
          journey: order.journey || 'agency',
          journeyId: order.journey_id || order.journeyId,
          statusId: order.status_id || order.statusId,
          paymentMethodId: order.payment_method_id || order.paymentMethodId,
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
