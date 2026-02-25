import { db, voicejarEvents, voicejarSessions } from '@/lib/system/db';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 *  NUCLEAR VOICEJAR API (2026)
 * 
 * Verwerkt rrweb chunks en slaat ze op in de database.
 * Voldoet aan het Master Voices Protocol: Data-only, System-aware.
 */

export const dynamic = 'force-dynamic';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorHash, events, url, userAgent, iapContext } = body;

    if (!visitorHash || !events || !events.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 🛡️ CHRIS-PROTOCOL: 3s internal timeout for Voicejar writes
    const recordPromise = (async () => {
      try {
        // 1. Check of sessie bestaat of maak nieuwe
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
          await db.update(voicejarSessions)
            .set({
              eventCount: (existingSession.eventCount || 0) + events.length,
              updatedAt: new Date()
            })
            .where(eq(voicejarSessions.visitorHash, visitorHash));
        }

        // 2. Sla events op
        const eventInserts = events.map((event: any, index: number) => ({
          sessionId: visitorHash,
          eventData: event,
          sequenceOrder: (existingSession?.eventCount || 0) + index
        }));

        if (eventInserts.length > 0) {
          await db.insert(voicejarEvents).values(eventInserts);
        }
      } catch (dbError) {
        console.warn(' Voicejar Drizzle failed, falling back to SDK');
        
        // SDK Fallback voor sessie
        const { data: existingSession, error: sessionError } = await supabase
          .from('voicejar_sessions')
          .select('*')
          .eq('visitor_hash', visitorHash)
          .single();

        if (!existingSession) {
          await supabase.from('voicejar_sessions').insert({
            visitor_hash: visitorHash,
            url,
            user_agent: userAgent,
            iap_context: iapContext || {},
            status: 'active'
          });
        } else {
          await supabase.from('voicejar_sessions')
            .update({
              event_count: (existingSession.event_count || 0) + events.length,
              updated_at: new Date().toISOString()
            })
            .eq('visitor_hash', visitorHash);
        }

        // SDK Fallback voor events
        const eventInserts = events.map((event: any, index: number) => ({
          session_id: visitorHash,
          event_data: event,
          sequence_order: (existingSession?.event_count || 0) + index
        }));

        if (eventInserts.length > 0) {
          const { error: eventError } = await supabase.from('voicejar_events').insert(eventInserts);
          if (eventError) throw eventError;
        }
      }
    })();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Voicejar record timeout (3s)')), 3000)
    );

    try {
      await Promise.race([recordPromise, timeoutPromise]);
    } catch (err: any) {
      console.warn(' [VOICEJAR API] Timeout reached, returning success to client to prevent 504');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' VOICEJAR API FAILURE:', {
      message: error.message,
      error: error
    });
    //  Graceful Fallback: Don't crash the client if DB write fails
    return NextResponse.json({ success: false, message: 'Recording buffered' }, { status: 200 });
  }
}
