import { NextResponse } from "next/server";
import { db, orders, users, refunds } from '@/lib/system/db';
import { eq, ilike, inArray } from "drizzle-orm";

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping debug-audit during build' });
  }

  try {
    const evelyneOrders = await db.select({
      wpOrderId: orders.wpOrderId,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(ilike(users.lastName, '%Benbassat%'));

    const allRefunds = await db.select().from(refunds).limit(10);

    const orphanedOrderIds = [271508, 268183, 268735, 274349, 268242, 268902, 268180, 268330, 268527, 268894, 275987, 268331, 269084, 269102, 268634, 268570, 268786, 268323, 271519, 270848, 269071, 268871, 268254, 268958, 268787, 268201, 269086, 268632, 268607, 268793, 268877, 268592];
    
    const orphanedStatuses = await db.select({
      wpOrderId: orders.wpOrderId,
      status: orders.status
    })
    .from(orders)
    .where(inArray(orders.wpOrderId, orphanedOrderIds.map(id => id)));

    return NextResponse.json({
      evelyneOrders,
      refundsSample: allRefunds,
      orphanedStatuses
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
