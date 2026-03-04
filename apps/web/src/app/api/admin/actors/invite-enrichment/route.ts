import { db, users } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ACTOR INVITE ENRICHMENT (2026)
 *  Generates a secure magic link for an existing actor to complete their profile.
 */

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Fetch user to ensure they exist and are an actor
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Generate secure token (valid for 7 days)
    const secret = process.env.JWT_SECRET || 'voices-secret-2026';
    const token = sign(
      { 
        userId: user.id, 
        email: user.email,
        purpose: 'actor_enrichment',
        version: '2026.1'
      }, 
      secret, 
      { expiresIn: '7d' }
    );

    // 3. Construct the URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.voices.be';
    const inviteUrl = `${baseUrl}/account/signup?token=${token}&enrich=true`;

    return NextResponse.json({ 
      success: true, 
      inviteUrl,
      email: user.email 
    });

  } catch (error) {
    console.error('[Invite Enrichment Error]:', error);
    return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
  }
}
