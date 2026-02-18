import { NextResponse } from "next/server";
import { db } from "@db";
import { locations } from "@db/schema";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await db.select().from(locations);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    if (data.id) {
      await db.update(locations).set(data).where(eq(locations.id, data.id));
    } else {
      await db.insert(locations).values(data);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
