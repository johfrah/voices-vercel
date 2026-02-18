import { eq, ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actors, media } from "../../packages/database/src/schema/index";

async function migrateMusic() {
  try {
    console.log("🚀 Start Forensische Muziek Migratie...");

    // 1. Zoek de 'muziek-actors' die eigenlijk producten zijn
    const musicActors = await db.query.actors.findMany({
      where: or(
        ilike(actors.tagline, '%geschikte wachtmuziek%'),
        ilike(actors.firstName, '%Mountain%'),
        ilike(actors.firstName, '%Upbeat%'),
        ilike(actors.firstName, '%Free%'),
        ilike(actors.firstName, '%Around-the-world%'),
        ilike(actors.firstName, '%Before-you%'),
        ilike(actors.firstName, '%Come-back%')
      ),
      with: {
        demos: true
      }
    });

    console.log(`\n🔍 Gevonden: ${musicActors.length} muziek-actors.`);

    for (const actor of musicActors) {
      console.log(`\nVerwerken: ${actor.firstName}...`);
      
      if (!actor.demos || actor.demos.length === 0) {
        console.log(`  ⚠️ Geen demo gevonden voor ${actor.firstName}, kan niet migreren naar media.`);
        continue;
      }

      for (const demo of actor.demos) {
        // Check of dit bestand al in media staat met category 'music'
        const existingMedia = await db.select().from(media).where(eq(media.filePath, demo.url)).limit(1);
        
        if (existingMedia.length > 0) {
          console.log(`  ✨ Media bestaat al voor ${demo.name}, updaten naar category 'music'...`);
          await db.update(media)
            .set({ 
              category: 'music', 
              altText: actor.firstName,
              metadata: { vibe: 'Onze eigen muziek', originalActorId: actor.id } 
            })
            .where(eq(media.id, existingMedia[0].id));
        } else {
          console.log(`  📝 Nieuw media record aanmaken voor ${demo.name}...`);
          await db.insert(media).values({
            fileName: `${actor.firstName.toLowerCase()}.mp3`,
            filePath: demo.url,
            fileType: 'audio/mpeg',
            category: 'music',
            altText: actor.firstName,
            metadata: { vibe: 'Onze eigen muziek', originalActorId: actor.id },
            isPublic: true
          });
        }
      }

      // Optioneel: De actor status op 'archived' zetten of zo laten? 
      // De gebruiker wil dat het MUZIEK is, niet een actor.
      console.log(`  ✅ ${actor.firstName} succesvol getransformeerd naar MUZIEK entiteit.`);
    }

    console.log("\n🏁 Migratie voltooid. De media tabel is nu de enige Source of Truth voor muziek.");

  } catch (error) {
    console.error("❌ Fout tijdens migratie:", error);
  }
}

migrateMusic();
