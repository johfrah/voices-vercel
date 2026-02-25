import { db, workshopEditions, orderItems, orders } from '@/lib/system/db';
import { eq, and, sql, or, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workshopId = searchParams.get("workshopId");

  if (!workshopId) {
    return NextResponse.json({ error: "Workshop ID is required" }, { status: 400 });
  }

  try {
    // Haal edities op inclusief deelnemers count
    const results = await db.select({
      id: workshopEditions.id,
      workshopId: workshopEditions.workshopId,
      title: workshopEditions.title,
      date: workshopEditions.date,
      endDate: workshopEditions.endDate,
      locationId: workshopEditions.locationId,
      instructorId: workshopEditions.instructorId,
      price: workshopEditions.price,
      capacity: workshopEditions.capacity,
      status: workshopEditions.status,
      participantCount: sql<number>`CAST(COUNT(${orderItems.id}) AS INTEGER)`
    })
    .from(workshopEditions)
    .leftJoin(orderItems, eq(orderItems.editionId, workshopEditions.id))
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(workshopEditions.workshopId, parseInt(workshopId)),
        or(
          eq(orders.status, 'completed'),
          eq(orders.status, 'processing'),
          sql`${orders.id} IS NULL` // Ook edities zonder orders tonen
        )
      )
    )
    .groupBy(workshopEditions.id)
    .orderBy(desc(workshopEditions.date));

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Get editions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
