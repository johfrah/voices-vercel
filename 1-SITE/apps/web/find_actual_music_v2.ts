import { and, ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function findActualMusic() {
  try {
    // Zoek naar audio bestanden die NIET in de 'voices' of 'demos' categorie zitten
    // maar wel een van de bekende namen hebben
    const keywords = ['Mountain', 'Upbeat', 'Free', 'Around-the-world', 'Before-you', 'Come-back', 'Enjoy', 'Sunday', 'Sky', 'Sunlapse', 'Happy', 'Homecoming', 'Warm', 'Open', 'Promotional', 'Joyful', 'Relax', 'Summer', 'Midwest', 'Modern'];
    
    const conditions = keywords.flatMap(k => [
      ilike(media.fileName, `%${k}%`),
      ilike(media.altText, `%${k}%`)
    ]);
    
    const results = await db.select().from(media).where(
      and(
        or(...conditions),
        or(
          ilike(media.fileName, '%.mp3'),
          ilike(media.fileName, '%.wav')
        )
      )
    );
    
    // Filter out obvious voice demos (those containing 'demo' in the filename or in 'voices'/'demos' category)
    const filtered = results.filter(m => {
      const isVoiceCat = m.category === 'voices' || m.category === 'demos';
      const isDemoFile = m.fileName.toLowerCase().includes('demo');
      // We willen items die OF niet in voice cat zitten, OF geen demo in de naam hebben (indien ze wel in voice cat zitten)
      return !isVoiceCat || !isDemoFile;
    });
    
    console.log("Potentiële muziek producten (geen stem-demos):");
    console.log(JSON.stringify(filtered.map(m => ({ 
      id: m.id, 
      fileName: m.fileName, 
      category: m.category, 
      altText: m.altText,
      filePath: m.filePath
    })), null, 2));

  } catch (error) {
    console.error("Fout:", error);
  }
}

findActualMusic();
