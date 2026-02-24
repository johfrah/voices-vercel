import { db } from "@db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import * as schema from '@db/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 🛡️ CHRIS-PROTOCOL: Use schema export for 100% accuracy and stability
    // We iterate over all exported members of the schema and check if they are Drizzle tables
    const tableNames: string[] = [];
    
    for (const key in schema) {
      const item = (schema as any)[key];
      if (item && typeof item === 'object' && ('tableName' in item)) {
        tableNames.push(item.tableName);
      }
    }

    const uniqueTables = [...new Set(tableNames)].sort();

    if (uniqueTables.length > 0) {
      return NextResponse.json({ 
        tables: uniqueTables, 
        count: uniqueTables.length,
        _source: 'schema_export_v2' 
      });
    }

    // Fallback naar hardcoded lijst indien alles faalt
    const fallbackTables = [
      'actors', 'users', 'orders', 'order_items', 
      'reviews', 'media', 'actor_demos', 'translations',
      'casting_lists', 'system_events'
    ];

    return NextResponse.json({ 
      tables: fallbackTables, 
      count: fallbackTables.length, 
      _source: 'hardcoded_fallback' 
    });
  } catch (error: any) {
    console.error('Error fetching database tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables', message: error.message }, { status: 500 });
  }
}
