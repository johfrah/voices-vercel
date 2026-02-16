import { db } from '@db';
import { locations, instructors } from '@db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 * 🎙️ API: ADMIN STUDIO METADATA (2026)
 * GET: Haalt alle locaties en instructeurs op voor de editor
 */

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const [allLocations, allInstructors] = await Promise.all([
      db.select().from(locations),
      db.select().from(instructors)
    ]);

    return NextResponse.json({
      locations: allLocations,
      instructors: allInstructors
    });
  } catch (error) {
    console.error('[Admin Studio Metadata GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
