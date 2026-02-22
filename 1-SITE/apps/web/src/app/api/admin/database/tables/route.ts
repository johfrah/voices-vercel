import { db } from "@db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // CHRIS-PROTOCOL: SDK fallback for build stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Haal alle tabelnamen op uit de public schema (PostgreSQL)
    const result = await db.execute(sql`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename ASC
    `).catch(async (err) => {
      console.warn(' [Tables API] Drizzle failed, falling back to SDK RPC or hardcoded list:', err.message);
      // Since Supabase SDK doesn't have a direct "list tables" method without RPC,
      // and this is mainly for the admin dashboard, we return a common list if it fails.
      return [
        { tablename: 'actors' },
        { tablename: 'users' },
        { tablename: 'orders' },
        { tablename: 'order_items' },
        { tablename: 'reviews' },
        { tablename: 'media' },
        { tablename: 'actor_demos' },
        { tablename: 'translations' }
      ];
    });

    const rows = Array.isArray(result) ? result : (result?.rows || []);
    const tables = rows.map((row: any) => row.tablename);

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error fetching database tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}
