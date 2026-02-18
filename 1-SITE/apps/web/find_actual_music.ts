import { ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function findMusic() {
  try {
    // Zoek naar de specifieke namen die de gebruiker noemde in de HELE media tabel
    const keywords = ['Mountain', 'Upbeat', 'Free', 'Around-the-world', 'Before-you', 'Come-back'];
    const conditions = keywords.flatMap(k => [
      ilike(media.fileName, `%${k}%`),
      ilike(media.altText, `%${k}%`)
    ]);
    
    const results = await db.select().from(media).where(or(...conditions));
    
    console.log("Gevonden media items op basis van keywords:");
    console.log(JSON.stringify(results.map(m => ({ 
      id: m.id, 
      fileName: m.fileName, 
      category: m.category, 
      altText: m.altText,
      filePath: m.filePath
    })), null, 2));

    // Check ook even wat de meest voorkomende categorieën zijn voor audio
    const allAudio = await db.select({ category: media.category }).from(media).where(ilike(media.fileName, '%.mp3'));
    const catCounts: Record<string, number> = {};
    allAudio.forEach(a => {
      const cat = a.category || 'onbekend';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    console.log("\nAudio categorie verdeling:", catCounts);

  } catch (error) {
    console.error("Fout bij zoeken naar muziek:", error);
  }
}

findMusic();
