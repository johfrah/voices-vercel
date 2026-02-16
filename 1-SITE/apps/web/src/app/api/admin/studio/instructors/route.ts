import { NextResponse } from "next/server";
import { db } from "@db";
import { instructors } from "@db/schema";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    if (data.id) {
      await db.update(instructors).set(data).where(eq(instructors.id, data.id));
    } else {
      await db.insert(instructors).values(data);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
