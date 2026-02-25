import { db } from '@db';
import { orders, users, notifications, orderItems } from '@db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 *  API: ADMIN ORDERS (2026)
 * 
 * Haalt alle bestellingen op voor de admin cockpit, inclusief klantgegevens.
 */

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const allOrders = await db.select({
      id: orders.id,
      wpOrderId: orders.wpOrderId,
      displayOrderId: orders.displayOrderId,
      total: orders.total,
      status: orders.status,
      journey: orders.journey,
      createdAt: orders.createdAt,
      isQuote: orders.isQuote,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        companyName: users.companyName
      }
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(50)
    .catch(async (err: any) => {
      console.warn(' Admin Orders Drizzle failed, falling back to SDK:', err.message);
      const { data, error } = await sdkClient
        .from('orders')
        .select('*, user:users(*)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error(' Admin Orders SDK fallback failed:', error.message);
        return [];
      }
      return (data || []).map(o => ({
        ...o,
        createdAt: new Date(o.created_at),
        user: o.user ? {
          firstName: o.user.first_name,
          lastName: o.user.last_name,
          email: o.user.email,
          companyName: o.user.company_name
        } : null
      }));
    });

    return NextResponse.json(allOrders);
  } catch (error) {
    console.error('[Admin Orders GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
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
      isManuallyEdited: true,
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
      isManuallyEdited: true,
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
    if (internalNotes) updateData.internalNotes = internalNotes;
    updateData.updatedAt = new Date();

    const [updatedOrder] = await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();

    // 🔔 NOTIFICATION ENGINE (2026)
    // Wanneer de status verandert, maken we een notificatie aan voor de klant.
    if (status && updatedOrder.userId) {
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
          userId: updatedOrder.userId,
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
