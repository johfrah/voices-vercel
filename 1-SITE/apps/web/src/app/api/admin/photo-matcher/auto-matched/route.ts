import { db } from '@db';
import { actors, media } from '@db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/api-auth';

export async function GET() {
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
    .limit(100);

    return NextResponse.json(autoMatched);
  } catch (error: any) {
    console.error('Auto-matched fetch error:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
