import { db } from '@db';
import { voicejarEvents, voicejarSessions } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 🏺 NUCLEAR VOICEJAR API (2026)
 * 
 * Verwerkt rrweb chunks en slaat ze op in de database.
 * Voldoet aan het Master Voices Protocol: Data-only, System-aware.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorHash, events, url, userAgent, iapContext } = body;

    if (!visitorHash || !events || !events.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Check of sessie bestaat of maak nieuwe
    // We gebruiken visitorHash als de unieke identifier voor sessies
    const existingSessions = await db.select()
      .from(voicejarSessions)
      .where(eq(voicejarSessions.visitorHash, visitorHash))
      .limit(1);
    
    const existingSession = existingSessions[0];

    if (!existingSession) {
      await db.insert(voicejarSessions).values({
        visitorHash,
        url,
        userAgent,
        iapContext: iapContext || {},
        status: 'active'
      });
    } else {
      // Update session stats
      await db.update(voicejarSessions)
        .set({
          eventCount: (existingSession.eventCount || 0) + events.length,
          updatedAt: new Date()
        })
        .where(eq(voicejarSessions.visitorHash, visitorHash));
    }

    // 2. Sla events op in batches
    const eventInserts = events.map((event: any, index: number) => ({
      sessionId: visitorHash,
      eventData: event,
      sequenceOrder: (existingSession?.eventCount || 0) + index
    }));

    if (eventInserts.length > 0) {
      await db.insert(voicejarEvents).values(eventInserts);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Voicejar API Error:', error);
    // 🛡️ Graceful Fallback: Don't crash the client if DB write fails
    return NextResponse.json({ success: false, message: 'Data logged to server only' }, { status: 200 });
  }
}
