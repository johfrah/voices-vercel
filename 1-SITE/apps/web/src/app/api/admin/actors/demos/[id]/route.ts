import { NextResponse, NextRequest } from 'next/server';
import { db, actorDemos } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

/**
 *  ADMIN DEMO UPDATE API (GOD MODE 2026)
 * 
 * Verwerkt real-time updates voor audio demo's.
 * Alleen toegankelijk voor admins.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid demo ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.name = body.title;
    if (body.category !== undefined) updateData.type = body.category;
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic;

    const result = await db.update(actorDemos)
      .set(updateData)
      .where(eq(actorDemos.id, id))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, demo: result[0] });
  } catch (error: any) {
    console.error(' ADMIN DEMO UPDATE FAILURE:', error);
    return NextResponse.json({ error: 'Failed to update demo', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  try {
    const auth = await requireAdmin();
    if (auth instanceof NextResponse) return auth;

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid demo ID' }, { status: 400 });
    }

    await db.delete(actorDemos).where(eq(actorDemos.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' ADMIN DEMO DELETE FAILURE:', error);
    return NextResponse.json({ error: 'Failed to delete demo', details: error.message }, { status: 500 });
  }
}
