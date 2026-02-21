import { db } from '@db';
import { orders, users, notifications } from '@db/schema';
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
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        companyName: users.companyName
      }
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

    return NextResponse.json(allOrders);
  } catch (error) {
    console.error('[Admin Orders GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
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
