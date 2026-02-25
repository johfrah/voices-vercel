import { db, reviews } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: ADMIN REVIEWS UPDATE (SPOTLIGHT 2026)
 *  Maakt het mogelijk om reviews direct vanuit de frontend te beheren.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing review ID' }, { status: 400 });
    }

    //  CHRIS-PROTOCOL: Alleen toegestane velden updaten
    const allowedUpdates: any = {};
    if (updates.businessSlug !== undefined) allowedUpdates.businessSlug = updates.businessSlug;
    if (updates.isHero !== undefined) allowedUpdates.isHero = updates.isHero;
    if (updates.sector !== undefined) allowedUpdates.sector = updates.sector;
    if (updates.persona !== undefined) allowedUpdates.persona = updates.persona;
    if (updates.status !== undefined) allowedUpdates.status = updates.status; // Voor hiden/showen (indien kolom bestaat)
    
    // Als we 'hidden' status willen simuleren maar de kolom bestaat niet, 
    // kunnen we business_slug naar iets anders zetten of een status kolom toevoegen.
    // Voor nu gaan we ervan uit dat we business_slug kunnen gebruiken als 'trash' of status.

    await db.update(reviews)
      .set({
        ...allowedUpdates,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id));

    return NextResponse.json({ success: true, id, updated: allowedUpdates });
  } catch (error) {
    console.error('[Admin Reviews POST Error]:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
