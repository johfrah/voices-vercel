import { NextResponse } from "next/server";
import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    const maxIdResult: any = await db.execute(sql`
      select coalesce(max(id), 260250) as max_id
      from workshops
    `);
    const maxRows = Array.isArray(maxIdResult)
      ? maxIdResult
      : Array.isArray(maxIdResult?.rows)
        ? maxIdResult.rows
        : [];
    const nextId = Number(maxRows[0]?.max_id || 260250) + 1;
    const programJson = data.program ? JSON.stringify(data.program) : null;
    const metaJson = data.meta ? JSON.stringify(data.meta) : null;

    await db.execute(sql`
      insert into workshops (
        id,
        title,
        slug,
        description,
        price,
        duration,
        instructor_id,
        program,
        meta,
        date,
        wp_product_id,
        status,
        world_id
      ) values (
        ${nextId},
        ${String(data.title || '').trim()},
        ${String(data.slug || '').trim()},
        ${data.description || null},
        ${data.price ? String(data.price) : null},
        ${data.duration || null},
        ${data.instructorId || null},
        ${programJson ? sql`cast(${programJson} as jsonb)` : sql`null`},
        ${metaJson ? sql`cast(${metaJson} as jsonb)` : sql`null`},
        ${new Date().toISOString()},
        ${nextId},
        ${'live'},
        ${2}
      )
    `);

    return NextResponse.json({ success: true, id: nextId });
  } catch (err: any) {
    console.error("Create workshop catalog error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
