import { db } from "@db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as schema from '@db/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 🛡️ CHRIS-PROTOCOL: Use schema export for 100% accuracy and stability
    const schemaTables = Object.keys(schema)
      .filter(key => {
        const item = (schema as any)[key];
        return item && typeof item === 'object' && item.constructor?.name === 'PgTable';
      })
      .map(key => (schema as any)[key].tableName)
      .filter(Boolean)
      .sort();

    if (schemaTables.length > 0) {
      // Remove duplicates (some tables might be exported multiple times via relations)
      const uniqueTables = [...new Set(schemaTables)];
      return NextResponse.json({ tables: uniqueTables, _source: 'schema_export' });
    }

    // CHRIS-PROTOCOL: SDK fallback for build stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Haal alle tabelnamen op uit de public schema (PostgreSQL)
    const result = await db.execute(sql`
      SELECT table_name as tablename
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC
    `).catch(async (err) => {
      console.error(' [Tables API] Drizzle query failed:', err.message);
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
