import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { voicejarSessions } from '@db/schema';
import { desc, gt, and, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 *  LIVE VISITORS API (2026)
 * 
 * Haalt alle actieve sessies op van de laatste 15 minuten.
 * Gekoppeld aan Voicejar data.
 */

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sdkClient = createSupabaseClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Definieer wat we als "live" beschouwen (laatste 15 minuten activiteit)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // 2. Query de actieve sessies
    const activeSessions = await db.query.voicejarSessions.findMany({
      where: and(
        eq(voicejarSessions.status, 'active'),
        gt(voicejarSessions.updatedAt, fifteenMinutesAgo)
      ),
      with: {
        user: true
      },
      orderBy: [desc(voicejarSessions.updatedAt)],
      limit: 50
    }).catch(async (err) => {
      console.warn(' Live Visitors Drizzle failed, falling back to SDK:', err.message);
      const { data, error } = await sdkClient
        .from('voicejar_sessions')
        .select('*, user:users(*)')
        .eq('status', 'active')
        .gt('updated_at', fifteenMinutesAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error(' Live Visitors SDK fallback failed:', error.message);
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

    // 3. Formatteer voor de cockpit
    const visitors = activeSessions.map(session => ({
      id: session.id,
      visitorHash: session.visitorHash,
      url: session.url,
      duration: Math.floor((new Date().getTime() - session.createdAt!.getTime()) / 1000),
      eventCount: session.eventCount,
      ipAddress: session.ipAddress,
      user: session.user ? {
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email
      } : null,
      updatedAt: session.updatedAt
    }));

    return NextResponse.json({ 
      visitors,
      count: visitors.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(' Live Visitors API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
