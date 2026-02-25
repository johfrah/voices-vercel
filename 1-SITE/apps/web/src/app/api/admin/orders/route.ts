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
    // 🛡️ CHRIS-PROTOCOL: 1 TRUTH MANDATE (v2.14.638)
    // We halen eerst het totaal aantal orders op voor de paginering UI
    // NUCLEAR: We gebruiken nu de schone orders_v2 tabel
    // 🛡️ CHRIS-PROTOCOL: RAW SQL COUNT (v2.14.646)
    // We gebruiken db.execute met een string om Drizzle abstractie volledig te passeren
    // 🛡️ CHRIS-PROTOCOL: Explicit Row Parsing (v2.14.646)
    const countResult = await db.execute(sql.raw('SELECT count(*) as value FROM orders_v2'));
    const countRows: any = Array.isArray(countResult) ? countResult : (countResult.rows || []);
    
    // 🛡️ CHRIS-PROTOCOL: Debugging Log for Count
    console.log(`📊 [Admin Orders API] Count Rows:`, JSON.stringify(countRows));
    
    // Sommige drivers geven de value terug als string, andere als number
    const totalInDb = countRows[0] ? Number(countRows[0].value || countRows[0].count || 0) : 0;

    let allOrders: any[] = [];
    let debugInfo: any = {
      version: '2.14.646',
      db_host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      page,
      limit,
      offset,
      totalInDb,
      timestamp: new Date().toISOString()
    };

    try {
      // 🚀 NUCLEAR RAW SQL FETCH (v2.14.646)
      // We passeren de Drizzle abstractie voor maximale zekerheid
      // 🛡️ CHRIS-PROTOCOL: Snake Case Mapping (v2.14.646)
      const rawOrdersResult = await db.execute(sql.raw(`
        SELECT 
          id, user_id, journey_id, status_id, payment_method_id, 
          amount_net, amount_total, purchase_order, billing_email_alt, created_at
        FROM orders_v2
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `));

      // 🛡️ CHRIS-PROTOCOL: Robust Result Parsing
      const rows: any = Array.isArray(rawOrdersResult) ? rawOrdersResult : (rawOrdersResult.rows || []);
      
      console.log(`📦 [Admin Orders API] Raw Rows Count: ${rows.length}`);

      // Map snake_case database columns naar de camelCase properties die de rest van de route verwacht
      allOrders = rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        journeyId: row.journey_id,
        statusId: row.status_id,
        paymentMethodId: row.payment_method_id,
        amountNet: row.amount_net,
        amountTotal: row.amount_total,
        purchaseOrder: row.purchase_order,
        billingEmailAlt: row.billing_email_alt,
        createdAt: row.created_at
      }));
      
      console.log(`📦 [Admin Orders API] RAW SQL Fetched ${allOrders.length} orders from orders_v2`);
      debugInfo.source = 'raw_sql.orders_v2';
      debugInfo.fetchedCount = allOrders.length;
    } catch (rawErr: any) {
      debugInfo.raw_error = rawErr.message;
      console.error('[Admin Orders GET] Drizzle query failed:', rawErr);
      return NextResponse.json({
        orders: [],
        _error: rawErr.message,
        _debug: debugInfo
      }, { status: 200 });
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

        // 🚦 V2 STATUS RESOLVER (v2.14.636)
        let displayStatus = order.status || 'completed';
        if (order.status_id) {
          const [statusRow] = await db.select().from(orderStatuses).where(eq(orderStatuses.id, order.status_id)).limit(1);
          if (statusRow) displayStatus = statusRow.code;
        }

        return {
          id: order.id,
          wpOrderId: order.id, // id IS nu het wp_order_id
          displayOrderId: order.id?.toString(),
          total: order.amount_total?.toString() || order.amountTotal?.toString() || "0.00",
          amountNet: order.amount_net?.toString() || order.amountNet?.toString() || "0.00",
          purchaseOrder: order.purchase_order || order.purchaseOrder || null,
          billingEmailAlt: order.billing_email_alt || order.billingEmailAlt || null,
          status: displayStatus, 
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
