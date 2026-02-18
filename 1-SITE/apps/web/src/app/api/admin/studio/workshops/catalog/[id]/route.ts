import { NextResponse } from "next/server";
import { db } from "@db";
import { workshops } from "@db/schema";
import { eq } from "drizzle-orm";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workshopId = parseInt(params.id);
  const data = await req.json();

  try {
    await db.update(workshops)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        duration: data.duration,
        instructorId: data.instructorId || null,
        mediaId: data.mediaId || null,
        program: data.program,
        meta: data.meta
      })
      .where(eq(workshops.id, workshopId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Update workshop catalog error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
