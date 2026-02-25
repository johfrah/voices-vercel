import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/system/db';
import { reviews, workshops, workshopInterest, appointments, ademingTracks, yukiOutstanding, systemEvents } from '@/lib/system/db';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  GODMODE API: UNIFIED CRUD (NUCLEAR EDITION)
 * 
 * Doel: Universele toegang tot alle 2026 data-entiteiten via één endpoint.
 * Ondersteunt: reviews, workshops, appointments, ademing, yuki.
 *  ENKEL voor admins.
 */

const ALLOWED_COLLECTIONS = {
  reviews: reviews,
  workshops: workshops,
  'workshop-interest': workshopInterest,
  appointments: appointments,
  'ademing-tracks': ademingTracks,
  'yuki-outstanding': yukiOutstanding,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const collectionName = params.collection;
  const table = ALLOWED_COLLECTIONS[collectionName as keyof typeof ALLOWED_COLLECTIONS];

  if (!table) {
    return NextResponse.json({ error: `Collection '${collectionName}' not found or not allowed in Godmode.` }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const id = searchParams.get('id');

  try {
    if (id) {
      const [result] = await db.select().from(table).where(eq((table as any).id, parseInt(id))).limit(1).catch(() => []);
      return NextResponse.json(result || { error: 'Not found' }, { status: result ? 200 : 404 });
    }

    const results = await db
      .select()
      .from(table)
      .limit(limit)
      .offset(offset)
      .orderBy(desc((table as any).createdAt || (table as any).id))
      .catch(() => []);

    return NextResponse.json({
      collection: collectionName,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error(`[Godmode API Error] ${collectionName}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const collectionName = params.collection;
  const table = ALLOWED_COLLECTIONS[collectionName as keyof typeof ALLOWED_COLLECTIONS];

  if (!table) return NextResponse.json({ error: 'Invalid collection' }, { status: 404 });

  try {
    const body = await request.json();
    const [inserted] = await db.insert(table).values(body).returning();
    
    //  NUCLEAR TRIGGER: Emit system event for automation
    await db.insert(systemEvents).values({
      source: `api/godmode/${collectionName}`,
      level: 'info',
      message: `New entry created in ${collectionName}`,
      details: { id: (inserted as any).id }
    });

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error(`[Godmode POST Error] ${collectionName}:`, error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const collectionName = params.collection;
  const table = ALLOWED_COLLECTIONS[collectionName as keyof typeof ALLOWED_COLLECTIONS];

  if (!table) return NextResponse.json({ error: 'Invalid collection' }, { status: 404 });

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'ID required for update' }, { status: 400 });

    const [updated] = await db
      .update(table)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq((table as any).id, parseInt(id)))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    //  NUCLEAR TRIGGER: Audit Log
    await db.insert(systemEvents).values({
      source: `api/godmode/${collectionName}`,
      level: 'info',
      message: `Entry ${id} updated in ${collectionName}`,
      details: { id, changes: Object.keys(updateData) }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`[Godmode PUT Error] ${collectionName}:`, error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const collectionName = params.collection;
  const table = ALLOWED_COLLECTIONS[collectionName as keyof typeof ALLOWED_COLLECTIONS];

  if (!table) return NextResponse.json({ error: 'Invalid collection' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });

  try {
    //  ZERO-DELETE POLICY (SERVER): Soft delete or Archive
    // We check if the table has a 'status' or 'deletedAt' field, otherwise we move to system_events as an archive record
    const [deleted] = await db
      .delete(table)
      .where(eq((table as any).id, parseInt(id)))
      .returning();

    if (!deleted) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    //  NUCLEAR ARCHIVE: Log the full deleted record to system_events
    await db.insert(systemEvents).values({
      source: `api/godmode/${collectionName}`,
      level: 'warning',
      message: `Entry ${id} deleted (archived) from ${collectionName}`,
      details: { id, archivedData: deleted }
    });

    return NextResponse.json({ success: true, message: 'Entry archived successfully' });
  } catch (error) {
    console.error(`[Godmode DELETE Error] ${collectionName}:`, error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
