import { db, media } from '@/lib/system/voices-config';
import { ilike, or, and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function GET(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "video"; // Default to video for workshops
  const worldCode = searchParams.get("world");

  try {
    let conditions = [
      ilike(media.fileName, `%${query}%`),
      type ? ilike(media.fileType, `%${type}%`) : undefined
    ].filter(Boolean) as any[];

    if (worldCode) {
      const { data: worldData } = await db.execute(sql`SELECT id FROM worlds WHERE code = ${worldCode}`).then(res => ({ data: res[0] as any }));
      if (worldData) {
        conditions.push(eq(media.worldId, worldData.id));
      }
    }

    const results = await db.select()
      .from(media)
      .where(and(...conditions))
      .limit(20);

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Search media error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
