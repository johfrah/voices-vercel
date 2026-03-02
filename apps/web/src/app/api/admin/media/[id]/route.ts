import { db } from '@/lib/system/voices-config';
import { media } from '@/lib/system/voices-config';
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mediaId = parseInt(params.id);

  try {
    const result = await db.query.media.findFirst({
      where: eq(media.id, mediaId)
    });

    if (!result) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Get media error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
