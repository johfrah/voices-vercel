import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { voicejarSessions } from '@db/schema';
import { desc, gt, and, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🏺 LIVE VISITORS API (2026)
 * 
 * Haalt alle actieve sessies op van de laatste 15 minuten.
 * Gekoppeld aan Voicejar data.
 */

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
    console.error('❌ Live Visitors API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
