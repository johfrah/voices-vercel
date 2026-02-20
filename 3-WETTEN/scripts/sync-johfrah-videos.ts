import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { actorVideos, actors } from '../../1-SITE/packages/database/src/schema';
import { eq } from "drizzle-orm";
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

/**
 * 🚀 SYNC JOHFRAH VIDEOS (2026)
 * 
 * Doel: Nieuwe video's koppelen aan Johfrah's profiel in Supabase.
 * Volgt het Chris-Protocol: Forensische precisie.
 */

async function syncVideos() {
  console.log("🎬 Starting video sync for Johfrah...");

  // 1. Find Johfrah's ID
  const johfrah = await db.query.actors.findFirst({
    where: eq(actors.firstName, 'Johfrah')
  });

  if (!johfrah) {
    console.error("❌ Johfrah not found in database!");
    return;
  }

  const actorId = johfrah.id;
  console.log(`✅ Found Johfrah (ID: ${actorId})`);

  // 2. Clear existing videos for Johfrah
  console.log("🧹 Clearing existing videos...");
  await db.delete(actorVideos).where(eq(actorVideos.actorId, actorId));

  // 3. Define new videos
  const videos = [
    { name: "Unizo Reporter", url: "/assets/common/branding/johfrah/portfolio/host-unizo.mp4", type: "local", menuOrder: 1 },
    { name: "Zorg Leuven", url: "/assets/common/branding/johfrah/portfolio/host-zorgleuven.mp4", type: "local", menuOrder: 2 },
    { name: "Reporter Showreel", url: "/assets/common/branding/johfrah/portfolio/host-reporter-2.mp4", type: "local", menuOrder: 3 },
    { name: "Beastlab Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-beastlab.mp4", type: "local", menuOrder: 4 },
    { name: "Bic Kids Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-bickids.mp4", type: "local", menuOrder: 5 },
    { name: "Husqvarna Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-husqvarna.mp4", type: "local", menuOrder: 6 },
    { name: "Nesquik Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-nesquik.mp4", type: "local", menuOrder: 7 },
    { name: "Pickup Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-pickup.mp4", type: "local", menuOrder: 8 },
    { name: "Stepstone Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-stepstone.mp4", type: "local", menuOrder: 9 },
    { name: "Trivago Portfolio", url: "/assets/common/branding/johfrah/portfolio/portfolio-trivago.mp4", type: "local", menuOrder: 10 },
    { name: "Canvas Showreel", url: "/assets/common/branding/johfrah/portfolio/video-canvas.mp4", type: "local", menuOrder: 11 },
    { name: "Kanaal Z Showreel", url: "/assets/common/branding/johfrah/portfolio/video-kanaalz.mp4", type: "local", menuOrder: 12 },
    { name: "Meditatie Video", url: "/assets/common/branding/johfrah/portfolio/video-meditatie.mp4", type: "local", menuOrder: 13 },
    { name: "Mexico Video", url: "/assets/common/branding/johfrah/portfolio/video-mexico.mp4", type: "local", menuOrder: 14 },
  ];

  // 4. Insert videos
  console.log(`📥 Inserting ${videos.length} videos...`);
  for (const video of videos) {
    await db.insert(actorVideos).values({
      actorId,
      name: video.name,
      url: video.url,
      type: video.type,
      menuOrder: video.menuOrder,
      isPublic: true
    });
    console.log(`   ✨ Added: ${video.name}`);
  }

  console.log("🚀 Sync completed successfully!");
}

syncVideos().catch(err => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
