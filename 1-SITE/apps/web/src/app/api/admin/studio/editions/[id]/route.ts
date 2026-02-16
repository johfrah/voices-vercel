import { db } from '@db';
import { workshopEditions } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🎙️ API: ADMIN STUDIO EDITION (2026)
 * PATCH: Update een specifieke workshop editie
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Filter alleen de velden die we mogen updaten
    const updateData: any = {};
    if (body.date) updateData.date = new Date(body.date);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.locationId !== undefined) updateData.locationId = body.locationId;
    if (body.instructorId !== undefined) updateData.instructorId = body.instructorId;
    if (body.price !== undefined) updateData.price = body.price.toString();
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.status) updateData.status = body.status;
    if (body.meta) updateData.meta = body.meta;

    const [updatedEdition] = await db.update(workshopEditions)
      .set(updateData)
      .where(eq(workshopEditions.id, id))
      .returning();

    return NextResponse.json(updatedEdition);
  } catch (error) {
    console.error('[Admin Studio Edition PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update edition' }, { status: 500 });
  }
}
