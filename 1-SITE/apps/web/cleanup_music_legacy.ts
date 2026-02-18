import { and, eq, ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function cleanupAndFixMusic() {
  try {
    console.log("🚀 Start Forensische Schoonmaak van Muziek...");

    // 1. Verwijder de Ademing tracks (aarde, lucht, water, vuur) uit de 'music' categorie
    const ademingKeywords = ['aarde', 'lucht', 'water', 'vuur', 'ademing'];
    const ademingConditions = ademingKeywords.map(k => ilike(media.fileName, `%${k}%`));
    
    console.log("🧹 Ademing tracks verwijderen uit 'music' categorie...");
    const ademingItems = await db.select().from(media).where(
      and(
        eq(media.category, 'music'),
        or(...ademingConditions)
      )
    );

    for (const item of ademingItems) {
      console.log(`  🗑️ Verwijderen: ${item.fileName} (was foutief gemarkeerd als muziek)`);
      // We zetten ze terug naar 'meditation' of 'background-music' (hun originele plek)
      await db.update(media)
        .set({ category: 'meditation' })
        .where(eq(media.id, item.id));
    }

    // 2. Zorg dat de ECHTE Voices Legacy muziek (Mountain, Upbeat, etc.) de JUISTE metadata heeft
    const legacyKeywords = ['Mountain', 'Upbeat', 'Free', 'Around the world', 'Away', 'Be there', 'Before you', 'Bigger', 'City', 'Come back', 'Dreamy', 'Enjoy', 'Friends', 'Glider', 'Happy', 'Homecoming', 'Midwest', 'Modern', 'Moonrider', 'More', 'Open', 'Promotional', 'Relax', 'Sky', 'Sunday', 'Sunlapse', 'Warm', 'Joyful', 'Summer'];
    
    console.log("\n✨ Voices Legacy muziek verankeren...");
    for (const keyword of legacyKeywords) {
      const legacyItems = await db.select().from(media).where(
        and(
          or(
            ilike(media.fileName, `%${keyword.replace(/ /g, '-')}%`),
            ilike(media.altText, `%${keyword}%`)
          ),
          ilike(media.fileName, '%.mp3')
        )
      );

      for (const item of legacyItems) {
        console.log(`  ✅ Verankeren: ${item.fileName} -> 'Onze eigen muziek'`);
        await db.update(media)
          .set({ 
            category: 'music',
            altText: keyword,
            metadata: { vibe: 'Onze eigen muziek', source: 'voices-legacy' }
          })
          .where(eq(media.id, item.id));
      }
    }

    console.log("\n🏁 Schoonmaak voltooid. Muziek is nu 100% Voices Legacy.");

  } catch (error) {
    console.error("❌ Fout:", error);
  }
}

cleanupAndFixMusic();
