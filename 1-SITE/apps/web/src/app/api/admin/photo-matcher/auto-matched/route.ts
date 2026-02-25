import { db, actors, media } from '@/lib/system/voices-config';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json([]);
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    // Haal alle media op die door de auto-matcher zijn verwerkt
    // We checken in de metadata JSONB op autoMatched: true
    const autoMatched = await db.select({
      id: media.id,
      fileName: media.fileName,
      filePath: media.filePath,
      actorId: actors.id,
      actorName: sql<string>`${actors.firstName} || ' ' || ${actors.lastName}`
    })
    .from(media)
    .leftJoin(actors, eq(actors.photoId, media.id))
    .where(sql`metadata->>'autoMatched' = 'true'`)
    .limit(100)
    .catch(() => []);

    return NextResponse.json(autoMatched);
  } catch (error: any) {
    console.error('Auto-matched fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
