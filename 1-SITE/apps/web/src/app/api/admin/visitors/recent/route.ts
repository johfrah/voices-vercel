import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/system/db';
import { voicejarSessions } from '@/lib/system/db';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 *  RECENT SESSIONS API (2026)
 * 
 * Haalt de laatste 50 voltooide of inactieve sessies op.
 * Onderdeel van de Intelligence Playlist.
 */

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Haal sessies op die niet meer "live" zijn (of gewoon de laatste 50)
    const sessions = await db.query.voicejarSessions.findMany({
      with: {
        user: true
      },
      orderBy: [desc(voicejarSessions.updatedAt)],
      limit: 50
    }).catch(async (err) => {
      console.warn(' Recent Sessions Drizzle failed, falling back to SDK:', err.message);
      const { data, error } = await sdkClient
        .from('voicejar_sessions')
        .select('*, user:users(*)')
        .order('updated_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error(' Recent Sessions SDK fallback failed:', error.message);
        return [];
      }
      return (data || []).map(s => ({
        ...s,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
        user: s.user ? {
          firstName: s.user.first_name,
          lastName: s.user.last_name,
          email: s.user.email
        } : null
      }));
    });

    // 2. Formatteer voor de cockpit
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      visitorHash: session.visitorHash,
      url: session.url,
      duration: session.duration || Math.floor((session.updatedAt!.getTime() - session.createdAt!.getTime()) / 1000),
      eventCount: session.eventCount,
      ipAddress: session.ipAddress,
      user: session.user ? {
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email
      } : null,
      updatedAt: session.updatedAt,
      createdAt: session.createdAt
    }));

    return NextResponse.json({ 
      sessions: formattedSessions,
      count: formattedSessions.length
    });

  } catch (error) {
    console.error(' Recent Sessions API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
