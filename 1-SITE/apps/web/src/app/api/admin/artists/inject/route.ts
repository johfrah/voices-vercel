import { NextResponse } from 'next/server';
import { db } from '@/lib/sync/bridge';
import { actors } from '@/lib/system/db';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  ADMIN ARTIST INJECTION API (GOD MODE 2026)
 * 
 * Injecteert een nieuwe artiest (zoals Youssef) direct in de database
 * om de fallback-architectuur te elimineren.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { slug, firstName, lastName, email, bio, vision, photo_url, website, youtubeUrl, linkedin, donation_current, donation_goal } = body;

    if (!slug || !firstName || !email) {
      return NextResponse.json({ error: 'Missing required fields (slug, firstName, email)' }, { status: 400 });
    }

    // Check if already exists
    const existing = await db.query.actors.findFirst({
      where: eq(actors.slug, slug)
    });

    if (existing) {
      return NextResponse.json({ error: 'Artist with this slug already exists', artist: existing }, { status: 409 });
    }

    // Inject into database
    const result = await db.insert(actors).values({
      slug,
      firstName,
      lastName: lastName || '',
      email,
      bio,
      tagline: 'Artist',
      status: 'live',
      isPublic: true,
      dropboxUrl: photo_url,
      website,
      youtubeUrl,
      linkedin,
      priceUnpaid: String(donation_current || 0),
      // We use internalNotes or a custom field for vision if needed, 
      // but for now we'll store it in bio or a pending field if schema allows
      pendingBio: vision, 
      voiceScore: 100, // High score for artists
      createdAt: new Date(),
      updatedAt: new Date(),
      extraLangs: JSON.stringify({ donation_goal }) // Store goal in extraLangs as JSON for now if no field exists
    }).returning();

    return NextResponse.json({ 
      success: true, 
      message: `Artist ${firstName} injected successfully`,
      artist: result[0]
    });

  } catch (error: any) {
    console.error(' ADMIN INJECTION FAILURE:', error);
    return NextResponse.json({ error: 'Failed to inject artist', details: error.message }, { status: 500 });
  }
}
