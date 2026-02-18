import { ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function checkMedia() {
  try {
    const musicFiles = await db.select().from(media).where(
      or(
        ilike(media.fileName, '%.mp3'),
        ilike(media.fileName, '%.wav'),
        ilike(media.fileName, '%.m4a')
      )
    );
    
    console.log("Audio files in media table:");
    const summary = musicFiles.map(m => ({ 
      id: m.id, 
      fileName: m.fileName, 
      category: m.category, 
      altText: m.altText 
    }));
    
    // Group by category to see where most audio files are
    const categories: Record<string, number> = {};
    summary.forEach(m => {
      const cat = m.category || 'null';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    console.log("\nAudio file counts by category:");
    console.log(JSON.stringify(categories, null, 2));

    // Look for names user mentioned
    const userNames = ['Mountain', 'Upbeat', 'Free', 'Corporate', 'Cinematic'];
    const filtered = summary.filter(m => 
      userNames.some(name => m.fileName.toLowerCase().includes(name.toLowerCase()))
    );
    console.log("\nAudio files matching user keywords:");
    console.log(JSON.stringify(filtered, null, 2));

  } catch (error) {
    console.error("Error checking media:", error);
  }
}

checkMedia();
