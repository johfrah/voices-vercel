import { NextResponse } from "next/server";
import { db } from "@db";
import { orderItems } from "@db/schema";
import { eq } from "drizzle-orm";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderItemId, editionId } = await req.json();

  try {
    await db.update(orderItems)
      .set({ 
        editionId: editionId,
        updatedAt: new Date()
      } as any)
      .where(eq(orderItems.id, orderItemId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Move participant error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
