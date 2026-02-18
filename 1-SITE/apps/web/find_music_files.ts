import { ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function findMusicFiles() {
  try {
    const keywords = ['Mountain', 'Upbeat', 'Free', 'Around-the-world', 'Before-you', 'Come-back', 'Enjoy', 'Sunday', 'Sky', 'Sunlapse', 'Happy', 'Homecoming', 'Warm', 'Open', 'Promotional', 'Joyful', 'Relax', 'Summer', 'Midwest', 'Modern'];
    
    // Zoek naar audio bestanden die deze namen bevatten
    const conditions = keywords.flatMap(k => [
      ilike(media.fileName, `%${k}%`),
      ilike(media.altText, `%${k}%`)
    ]);
    
    const results = await db.select().from(media).where(or(...conditions));
    
    // Filter op audio extensies
    const audioResults = results.filter(m => 
      m.fileName.toLowerCase().endsWith('.mp3') || 
      m.fileName.toLowerCase().endsWith('.wav')
    );
    
    console.log("Gevonden audio bestanden:");
    console.log(JSON.stringify(audioResults.map(m => ({ 
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

findMusicFiles();
