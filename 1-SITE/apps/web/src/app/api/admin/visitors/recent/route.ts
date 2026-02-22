import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { voicejarSessions } from '@db/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  RECENT SESSIONS API (2026)
 * 
 * Haalt de laatste 50 voltooide of inactieve sessies op.
 * Onderdeel van de Intelligence Playlist.
 */

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
    }).catch(() => []);

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
