import { db } from "@db";
import { systemEvents } from "@db/schema/index";
import { desc, eq, and, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 *  NUCLEAR LOG VIEWER API (2026)
 *  Haalt de laatste systeem-events op voor de admin dashboard.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const level = searchParams.get("level");

    let query = db.select().from(systemEvents);

    if (level && level !== 'all') {
      query = query.where(eq(systemEvents.level, level)) as any;
    }

    const results = await query
      .orderBy(desc(systemEvents.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, logs: results });
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
    const body = await request.json();
    const { message, level = 'error', source = 'browser', details = {} } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing message" }, { status: 400 });
    }

    // 🛡️ CHRIS-PROTOCOL: Spam preventie (max 1x per 10 min voor identieke client-fouten)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
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
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Logs Reporting Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
