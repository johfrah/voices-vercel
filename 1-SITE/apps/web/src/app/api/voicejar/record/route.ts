import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { voicejarSessions, voicejarEvents } from '@db/schema';
import { eq, sql } from 'drizzle-orm';

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
    const [existingSession] = await db.select()
      .from(voicejarSessions)
      .where(eq(voicejarSessions.visitorHash, visitorHash))
      .limit(1);

    let sessionId = visitorHash;

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
          eventCount: sql`${voicejarSessions.eventCount} + ${events.length}`,
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
  } catch (error) {
    console.error('❌ Voicejar API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
