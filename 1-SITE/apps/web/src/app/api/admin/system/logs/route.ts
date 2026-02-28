import { db, systemEvents } from '@/lib/system/voices-config';
import { desc, eq, and, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

//  CHRIS-PROTOCOL: Supabase SDK Fallback for Logging Stability
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

//  NUCLEAR VERSION: v2.13.15 (Godmode Zero)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 *  NUCLEAR LOG VIEWER API (2026)
 *  Haalt de laatste systeem-events op voor de admin dashboard.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const level = searchParams.get("level");
    const worldCode = searchParams.get("world");

    try {
      let query = db.select().from(systemEvents);
      let conditions = [];

      if (level && level !== 'all') {
        conditions.push(eq(systemEvents.level, level));
      }

      if (worldCode) {
        // 🌍 World-Aware filtering: Get world ID first
        const { data: worldData } = await supabase
          .from('worlds')
          .select('id')
          .eq('code', worldCode)
          .single();
        
        if (worldData) {
          // @ts-ignore - world_id exists in DB but might not be in Drizzle schema yet
          conditions.push(eq(systemEvents.worldId, worldData.id));
        }
      }

      const results = await query
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(systemEvents.createdAt))
        .limit(limit);

      return NextResponse.json({ success: true, logs: results });
    } catch (dbError) {
      console.warn('[Logs API] Drizzle failed, falling back to Supabase SDK:', dbError);
      
      let query = supabase.from('system_events').select('*').order('created_at', { ascending: false }).limit(limit);
      if (level && level !== 'all') {
        query = query.eq('level', level);
      }
      
      if (worldCode) {
        const { data: worldData } = await supabase
          .from('worlds')
          .select('id')
          .eq('code', worldCode)
          .single();
        
        if (worldData) {
          query = query.eq('world_id', worldData.id);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return NextResponse.json({ success: true, logs: data, _source: 'supabase_sdk' });
    }
  } catch (error: any) {
    console.error('[Logs API Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 *  CLIENT ERROR REPORTING
 *  Ontvangt fouten van de browser en slaat ze op in de Vault.
 */
export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { message, level = 'error', source = 'browser', details = {} } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing message" }, { status: 400 });
    }

    // 🛡️ CHRIS-PROTOCOL: Spam preventie (max 1x per 10 min voor identieke client-fouten)
    // Gebruik een echt Date object voor Drizzle (v2.16.001)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
      try {
        const recent = await db.select().from(systemEvents)
          .where(and(
            eq(systemEvents.message, message),
            gte(systemEvents.createdAt, tenMinutesAgo)
          ))
          .limit(1);

        if (recent.length > 0) {
          return NextResponse.json({ success: true, status: 'consolidated' });
        }

        await db.insert(systemEvents).values({
          level,
          source,
          message,
          details: {
            ...details,
            url: request.headers.get('referer'),
            userAgent: request.headers.get('user-agent'),
            timestamp: new Date()
          },
          createdAt: new Date()
        });
      } catch (dbError) {
      console.warn('[Logs Reporting] Drizzle failed, falling back to Supabase SDK:', dbError);
      
      const { data: recent } = await supabase.from('system_events')
        .select('id')
        .eq('message', message)
        .gte('created_at', tenMinutesAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        return NextResponse.json({ success: true, status: 'consolidated' });
      }

      const { error: insertError } = await supabase.from('system_events').insert({
        level,
        source,
        message,
        details: {
          ...details,
          url: request.headers.get('referer'),
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date()
        }
      });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Logs Reporting Error]:', error);
    // 🛡️ CHRIS-PROTOCOL: Silent fail for reporting to prevent infinite error loops
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
