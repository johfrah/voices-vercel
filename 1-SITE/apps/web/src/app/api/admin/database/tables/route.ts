import { db } from "@db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Haal alle tabelnamen op uit de public schema (PostgreSQL)
    const result = await db.execute(sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename ASC
    `);

    const rows = Array.isArray(result) ? result : (result?.rows || []);
    const tables = rows.map((row: any) => row.tablename);

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error fetching database tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}
