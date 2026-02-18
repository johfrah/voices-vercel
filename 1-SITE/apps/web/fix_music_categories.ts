import { and, ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function fixMusicCategories() {
  try {
    console.log("🚀 Start Forensisch Herstel van Muziek Categorieën...");

    // Zoek audio bestanden die in de verkeerde categorie staan maar overduidelijk muziek zijn
    const keywords = ['Mountain', 'Upbeat', 'Free', 'Around-the-world', 'Before-you', 'Come-back', 'Enjoy', 'Sunday', 'Sky', 'Sunlapse', 'Happy', 'Homecoming', 'Warm', 'Open', 'Promotional', 'Joyful', 'Relax', 'Summer', 'Midwest', 'Modern'];
    
    const conditions = keywords.flatMap(k => [
      ilike(media.fileName, `%${k}%`),
      ilike(media.altText, `%${k}%`)
    ]);
    
    const candidates = await db.select().from(media).where(
      and(
        or(...conditions),
        or(
          ilike(media.fileName, '%.mp3'),
          ilike(media.fileName, '%.wav')
        )
      )
    );

    console.log(`🔍 Gevonden kandidaten: ${candidates.length}`);

    for (const item of candidates) {
      // Als het een demo is van een "muziek-actor" (die we herkennen aan de naam)
      // en het staat in 'voices' of 'demos', zet het dan naar 'music'
      if (item.category === 'voices' || item.category === 'demos') {
        console.log(`✨ Herstellen: ${item.fileName} (${item.category} -> music)`);
        await db.update(media)
          .set({ 
            category: 'music',
            altText: item.altText || item.fileName.split('-')[0].charAt(0).toUpperCase() + item.fileName.split('-')[0].slice(1),
            metadata: { ...((item.metadata as any) || {}), vibe: 'Onze eigen muziek' }
          })
          .where(eq(media.id, item.id));
      }
    }

    console.log("\n🏁 Herstel voltooid.");

  } catch (error) {
    console.error("❌ Fout:", error);
  }
}

import { eq } from "drizzle-orm";
fixMusicCategories();
