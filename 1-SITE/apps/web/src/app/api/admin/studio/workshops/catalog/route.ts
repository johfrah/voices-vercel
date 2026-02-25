import { NextResponse } from "next/server";
import { db } from '@/lib/system/db';
import { workshops } from '@/lib/system/db';
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    // Voor nieuwe workshops moeten we een ID genereren of een unieke ID toekennen.
    // Aangezien we WooCommerce IDs gebruiken, moeten we voorzichtig zijn.
    // Voor handmatige toevoegingen kunnen we een hoge range gebruiken of serial laten doen.
    // Echter, de 'id' kolom is momenteel bigint en niet serial in de schema definitie (id: bigint('id', { mode: 'number' }).primaryKey()).
    
    // We zoeken de hoogste ID en doen +1
    const highestIdRes = await db.select({ id: workshops.id }).from(workshops).orderBy(workshops.id).limit(1).catch(() => []);
    const nextId = (highestIdRes[0]?.id || 1000000) + 1;

    await db.insert(workshops)
      .values({
        id: nextId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        duration: data.duration,
        instructorId: data.instructorId || null,
        program: data.program,
        meta: data.meta,
        date: new Date(), // Default date
        wpProductId: nextId // Keep sync
      });

    return NextResponse.json({ success: true, id: nextId });
  } catch (err: any) {
    console.error("Create workshop catalog error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
