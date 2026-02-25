import { db } from '@/lib/system/voices-config';
import { orders, users, notifications, orderItems } from '@/lib/system/voices-config';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN ORDERS (2026)
 * 
 * Haalt alle bestellingen op voor de admin cockpit, inclusief klantgegevens.
 */

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
        first_name: users.first_name,
        last_name: users.last_name,
        email: users.email,
        companyName: users.companyName
      }
    })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(250);

    // 🛡️ CHRIS-PROTOCOL: Nuclear Data Sanitization
    // We filteren eventuele corrupte data die de JSON response kan breken
    const sanitizedOrders = allOrders.map(order => ({
      ...order,
      total: order.total?.toString() || "0.00",
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt
    }));

    console.log(`[Admin Orders GET] Fetched ${sanitizedOrders.length} orders`);

    return NextResponse.json(sanitizedOrders);
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
