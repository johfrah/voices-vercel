import { eq, ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function checkMedia() {
  try {
    const bgMusic = await db.select().from(media).where(eq(media.category, 'background-music'));
    console.log("\nBackground-music category media:");
    console.log(JSON.stringify(bgMusic.map(m => ({ id: m.id, fileName: m.fileName, vibe: (m.metadata as any)?.vibe, altText: m.altText, category: m.category })), null, 2));
    
    // Check for specific keywords
    const keywords = ['Mountain', 'Upbeat', 'Free'];
    const searchConditions = keywords.map(k => ilike(media.fileName, `%${k}%`));
    const searchConditionsAlt = keywords.map(k => ilike(media.altText, `%${k}%`));
    
    const specificItems = await db.select().from(media).where(or(...searchConditions, ...searchConditionsAlt));
    console.log("\nSpecific keyword search results:");
    console.log(JSON.stringify(specificItems.map(m => ({ id: m.id, fileName: m.fileName, category: m.category, altText: m.altText })), null, 2));

  } catch (error) {
    console.error("Error checking media:", error);
  }
}

checkMedia();
