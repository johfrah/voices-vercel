import { eq } from "drizzle-orm";
import fs from 'fs';
import path from 'path';
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function syncMusicAssets() {
  try {
    console.log("🚀 Start Forensische Muziek Asset Synchronisatie...");

    const musicDir = "/Users/voices/Library/CloudStorage/Dropbox/voices-headless/1-SITE/assets/music";
    const subdirs = fs.readdirSync(musicDir);

    for (const subdir of subdirs) {
      if (subdir.startsWith('music-')) {
        const title = subdir.replace('music-', '').replace(/-/g, ' ');
        const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
        const previewFile = `${subdir}-preview.mp3`;
        const previewPath = path.join(musicDir, subdir, previewFile);

        if (fs.existsSync(previewPath)) {
          const relativePath = `assets/music/${subdir}/${previewFile}`;
          console.log(`\nVerwerken: ${capitalizedTitle}...`);

          // Check of dit al in media staat
          const existing = await db.select().from(media).where(eq(media.filePath, relativePath)).limit(1);

          if (existing.length > 0) {
            console.log(`  ✨ Media bestaat al, updaten naar category 'music'...`);
            await db.update(media)
              .set({ 
                category: 'music', 
                altText: capitalizedTitle,
                metadata: { vibe: 'Onze eigen muziek', source: 'filesystem-sync' } 
              })
              .where(eq(media.id, existing[0].id));
          } else {
            console.log(`  📝 Nieuw media record aanmaken voor ${capitalizedTitle}...`);
            await db.insert(media).values({
              fileName: previewFile,
              filePath: relativePath,
              fileType: 'audio/mpeg',
              category: 'music',
              altText: capitalizedTitle,
              metadata: { vibe: 'Onze eigen muziek', source: 'filesystem-sync' },
              isPublic: true
            });
          }
        }
      }
    }

    console.log("\n🏁 Synchronisatie voltooid.");

  } catch (error) {
    console.error("❌ Fout:", error);
  }
}

syncMusicAssets();
