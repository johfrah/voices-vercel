
import { db } from "@db";
import { actors, media } from "@db/schema";
import { eq, isNull, and, or, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api-auth";

export const dynamic = 'force-dynamic';

/**
 *  API: ADMIN PHOTO REPAIR (GOD MODE 2026)
 * 
 * Herstelt kapotte foto-links voor alle stemacteurs.
 * Fixes:
 * 1. Koppelt photo_id op basis van dropbox_url paden.
 * 2. Herstelt dropbox_url op basis van photo_id.
 * 3. Schoont dubbele proxy prefixen op.
 */
export async function POST() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, repairedCount: 0, logs: [] });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    console.log("🚀 STARTING PHOTO REPAIR API");
    
    // 1. Haal alle media op die recent zijn geüpload of in de voicecards map staan
    const mediaItems = await db.select().from(media).where(
      or(
        ilike(media.filePath, 'uploads/agency/voices/%'),
        ilike(media.filePath, 'agency/voices/misc/%'),
        ilike(media.filePath, 'active/voicecards/%'),
        ilike(media.filePath, 'visuals/active/voicecards/%')
      )
    );

    // 2. Haal alle acteurs op
    const allActors = await db.select().from(actors);
    let repairedCount = 0;
    const logs: string[] = [];

    for (const actor of allActors) {
      let needsUpdate = false;
      const updateData: any = {};

      // FIX A: photo_id mismatch (proxied URL maar geen ID)
      if (actor.dropboxUrl?.includes('/api/proxy') && !actor.photoId) {
        const fileNameMatch = actor.dropboxUrl.match(/path=([^&]+)/);
        if (fileNameMatch) {
          const decodedPath = decodeURIComponent(fileNameMatch[1]);
          const fileName = decodedPath.split('/').pop();
          
          const matchingMedia = mediaItems.find(m => m.fileName === fileName || m.filePath === decodedPath);
          if (matchingMedia) {
            updateData.photoId = matchingMedia.id;
            needsUpdate = true;
            logs.push(`Linked photoId ${matchingMedia.id} to actor ${actor.firstName}`);
          }
        }
      }

      // FIX B: Dubbele proxy URLs
      if (actor.dropboxUrl?.includes('https://www.voices.be/api/proxy')) {
        updateData.dropboxUrl = actor.dropboxUrl.replace('https://www.voices.be', '');
        needsUpdate = true;
        logs.push(`Cleaned double proxy for ${actor.firstName}`);
      }

      // FIX C: photo_id bestaat maar dropbox_url is leeg of oud
      if (actor.photoId && (!actor.dropboxUrl || actor.dropboxUrl.includes('dropbox.com'))) {
        const [mediaItem] = await db.select().from(media).where(eq(media.id, actor.photoId)).limit(1);
        if (mediaItem) {
          updateData.dropboxUrl = `/api/proxy/?path=${encodeURIComponent(mediaItem.filePath)}`;
          needsUpdate = true;
          logs.push(`Fixed dropboxUrl from photoId for ${actor.firstName}`);
        }
      }

      if (needsUpdate) {
        await db.update(actors).set({
          ...updateData,
          isManuallyEdited: true,
          updatedAt: new Date()
        }).where(eq(actors.id, actor.id));
        repairedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      repairedCount,
      logs 
    });

  } catch (error: any) {
    console.error('PHOTO REPAIR ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
