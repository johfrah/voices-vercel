import { NextRequest, NextResponse } from 'next/server';
import { db, voicejarEvents, voicejarSessions } from '@/lib/system/voices-config';
import { eq, asc } from 'drizzle-orm';

/**
 *  VISITOR EVENTS API (2026)
 * 
 * Haalt alle rrweb events op voor een specifieke visitor hash.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: { hash: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { hash } = params;

    if (!hash) {
      return NextResponse.json({ error: 'Missing hash' }, { status: 400 });
    }

    // 1. Haal de sessie op
    const [session] = await db.select()
      .from(voicejarSessions)
      .where(eq(voicejarSessions.visitorHash, hash))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Haal alle events op in de juiste volgorde
    const events = await db.select()
      .from(voicejarEvents)
      .where(eq(voicejarEvents.sessionId, hash))
      .orderBy(asc(voicejarEvents.sequenceOrder));

    // 3. Map naar de ruwe event data voor rrweb-player
    const rawEvents = events.map(e => e.eventData);

    return NextResponse.json({ 
      session,
      events: rawEvents,
      count: rawEvents.length
    });

  } catch (error) {
    console.error(' Visitor Events API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
