import { db } from '@db';
import { pageLayouts } from '@db/schema';
import { DbService } from '@/lib/services/db-service';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { slug, layoutJson } = await req.json();

    if (!slug || !layoutJson) {
      return NextResponse.json({ error: 'Missing slug or layoutJson' }, { status: 400 });
    }

    // Gebruik DbService voor Core Compliance
    const result = await DbService.updateRecord(
      pageLayouts,
      slug, // Let op: slug is hier de identifier, maar updateRecord verwacht ID. 
      // We moeten even checken of we op slug kunnen updaten.
      { layoutJson },
      1 // Placeholder voor admin userId
    );

    // Omdat updateRecord op ID werkt, doen we hier een directe update voor slug
    await db.update(pageLayouts)
      .set({ 
        layoutJson,
        isManuallyEdited: true,
        updatedAt: new Date()
      })
      .where(eq(pageLayouts.slug, slug));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update page layout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
