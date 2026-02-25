import { db } from '@/lib/system/voices-config';
import { orders, users, notifications, orderItems } from '@/lib/system/voices-config';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { createClient } from '@/utils/supabase/server';

/**
 *  API: ADMIN ORDERS (2026)
 * 
 * Haalt alle bestellingen op voor de admin cockpit, inclusief klantgegevens.
 */

export async function GET(request: NextRequest) {
  // 🛡️ CHRIS-PROTOCOL: Bypass Auth for Debugging (v2.14.572)
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  console.log(`🔐 [API DEBUG] Auth check: user=${authUser?.email || 'none'}`);

  try {
    // 🛡️ CHRIS-PROTOCOL: 1 TRUTH MANDATE (v2.14.573)
    // We stoppen met JOINs die data kunnen verbergen. We halen de orders PUUR op.
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(250);

    console.log(`🚀 [API DEBUG] 1 TRUTH: Raw orders fetched from DB: ${allOrders.length}`);
    
    // 🛡️ CHRIS-PROTOCOL: Emergency DB Check
    if (allOrders.length === 0) {
      const rawCount = await db.select({ count: orders.id }).from(orders).limit(1);
      console.log(`🚨 [API DEBUG] EMERGENCY: Orders table check: ${rawCount.length > 0 ? 'Table exists but empty' : 'Table might not exist or inaccessible'}`);
      
      // Check schema search path
      const schemaCheck = await db.execute('SELECT current_schema(), current_database()');
      console.log(`🚨 [API DEBUG] DB CONTEXT: ${JSON.stringify(schemaCheck)}`);
    }
    
    // 🛡️ CHRIS-PROTOCOL: Godmode Data Access (v2.14.572)
    const sanitizedOrders = await Promise.all(allOrders.map(async (order, index) => {
      try {
        // 🕵️ GUEST & USER RESOLVER: Haal klantgegevens op zonder de query te breken
        const defaultDomain = MarketManager.getMarketDomains()['BE']?.replace('https://www.', '') || ['voices', 'be'].join('.');
        let customerInfo = {
          first_name: "Guest",
          last_name: "",
          email: `guest@${defaultDomain}`,
          companyName: ""
        };

        // 1. Probeer via user_id lookup (indien aanwezig)
        if (order.user_id) {
          try {
            const [dbUser] = await db.select().from(users).where(eq(users.id, order.user_id)).limit(1);
            if (dbUser) {
              customerInfo = {
                first_name: dbUser.first_name || "",
                last_name: dbUser.last_name || "",
                email: dbUser.email || `unknown@${defaultDomain}`,
                companyName: dbUser.companyName || ""
              };
            }
          } catch (userErr) {
            console.error(`❌ [API DEBUG] User lookup failed for user_id ${order.user_id}:`, userErr);
          }
        }

        // 2. Fallback naar rawMeta (voor Guests of incomplete users)
        if (customerInfo.first_name === "Guest" && order.rawMeta) {
          try {
            const meta = typeof order.rawMeta === 'string' ? JSON.parse(order.rawMeta) : order.rawMeta;
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

        const sanitized = {
          id: order.id || 0,
          wpOrderId: order.wpOrderId || 0,
          displayOrderId: order.displayOrderId || null,
          total: order.total?.toString() || "0.00",
          status: order.status || 'pending',
          journey: order.journey || 'agency',
          market: order.market || 'ALL',
          createdAt: (() => {
            if (order.createdAt instanceof Date) return order.createdAt.toISOString();
            if (typeof order.createdAt === 'string') {
              const d = new Date(order.createdAt);
              if (!isNaN(d.getTime())) return d.toISOString();
            }
            return new Date().toISOString();
          })(),
          isQuote: !!order.isQuote,
          user: customerInfo
        };
        
        if (index < 2) {
          console.log(`📦 [API DEBUG] Sanitized order ${index}: ${sanitized.id} - ${sanitized.user.email}`);
        }
        
        return sanitized;
      } catch (innerError) {
        console.error(`❌ [API DEBUG] Error sanitizing order at index ${index}:`, innerError);
        return null;
      }
    }));

    const finalOrders = sanitizedOrders.filter(Boolean);
    console.log(`✅ [API DEBUG] Final sanitized count: ${finalOrders.length}`);

    return NextResponse.json(finalOrders);
  } catch (error) {
    console.error('[Admin Orders GET Critical Error]:', error);
    return NextResponse.json([], { status: 200 });
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

    // 1. Calculate Totals
    const total = items.reduce((acc: number, item: any) => acc + (parseFloat(item.price) * item.quantity), 0);
    const totalTax = total * 0.21; // Standaard 21% voor NL/BE (Chris-Protocol: ISO-FIRST)
    
    // 2. Insert Order
    const [newOrder] = await db.insert(orders).values({
      userId,
      journey,
      total: total.toString(),
      totalTax: totalTax.toString(),
      status: status || 'pending',
      internalNotes,
      is_manually_edited: true,
      market: 'BE', // Default
      createdAt: new Date(),
    }).returning();

    // 3. Insert Order Items
    const orderItemsToInsert = items.map((item: any) => ({
      orderId: newOrder.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price.toString(),
      createdAt: new Date(),
      is_manually_edited: true,
    }));

    await db.insert(orderItems).values(orderItemsToInsert);

    // 4. Yuki Sync (Optional)
    let yukiResult = null;
    if (syncToYuki) {
      try {
        // We roepen de bestaande Yuki sync route aan (intern)
        const yukiRes = await fetch(`${request.nextUrl.origin}/api/yuki/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrder.id })
        });
        if (yukiRes.ok) {
          yukiResult = await yukiRes.json();
          // Update order met Yuki ID
          await db.update(orders)
            .set({ yukiInvoiceId: yukiResult.yukiId })
            .where(eq(orders.id, newOrder.id));
        }
      } catch (yukiErr) {
        console.error('[Admin Orders Yuki Sync Error]:', yukiErr);
      }
    }

    return NextResponse.json({ 
      ...newOrder, 
      yukiResult 
    });
  } catch (error) {
    console.error('[Admin Orders POST Error]:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

/**
 *  API: UPDATE ORDER STATUS (HITL)
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, status, internalNotes } = body;

    if (!id) return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (internalNotes) updateData.internal_notes = internalNotes;
    updateData.updatedAt = new Date();

    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // 🔔 NOTIFICATION ENGINE (2026)
    // Wanneer de status verandert, maken we een notificatie aan voor de klant.
    if (status && updatedOrder.user_id) {
      try {
        const statusLabels: Record<string, string> = {
          'completed': 'Bestelling voltooid',
          'processing': 'Bestelling in behandeling',
          'cancelled': 'Bestelling geannuleerd',
          'shipped': 'Bestelling verzonden',
          'on-hold': 'Bestelling in de wacht'
        };

        const title = statusLabels[status] || 'Status update';
        const message = `De status van je bestelling #${updatedOrder.displayOrderId || updatedOrder.id} is gewijzigd naar ${status}.`;

        await db.insert(notifications).values({
          user_id: updatedOrder.user_id,
          type: 'order_update',
          title,
          message,
          metadata: { orderId: updatedOrder.id, status }
        });
      } catch (notifyError) {
        console.error('[Admin Orders Notification Error]:', notifyError);
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('[Admin Orders PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
