import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../packages/database/src/index';
import { actors, actorDemos, actorDialects } from '../../../../../packages/database/src/schema';
import { eq, sql } from 'drizzle-orm';

/**
 *  ACTOR SELF-SERVICE API (GODMODE)
 * 
 * Doel: Stemacteurs de controle geven over hun eigen data (vakantie, tarieven, demo's).
 */

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { actorId, availability, rates, bio, tagline } = body;

    if (!actorId) return NextResponse.json({ error: 'actorId required' }, { status: 400 });

    //  NUCLEAR LOCK: Alleen updaten als niet handmatig gelockt door admin
    const [actor] = await db.select().from(actors).where(eq(actors.id, actorId)).limit(1);
    if (actor?.isManuallyEdited) {
      return NextResponse.json({ error: 'Actor profile is locked by admin' }, { status: 403 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (availability) updateData.availability = availability;
    if (rates) updateData.rates = rates;
    if (bio) updateData.pendingBio = bio; // Gaat naar pending voor review
    if (tagline) updateData.pendingTagline = tagline;

    await db.update(actors).set(updateData).where(eq(actors.id, actorId));

    return NextResponse.json({ success: true, message: 'Profile update submitted' });
  } catch (error) {
    console.error('[Actor Self-Service Error]:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const actorId = searchParams.get('actorId');

  if (!actorId) return NextResponse.json({ error: 'actorId required' }, { status: 400 });

  const actorData = await db.query.actors.findFirst({
    where: eq(actors.id, parseInt(actorId)),
    with: {
      demos: true,
      dialects: true
    }
  });

  return NextResponse.json(actorData);
}
