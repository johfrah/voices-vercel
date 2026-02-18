import { eq, ne } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function checkMedia() {
  try {
    const musicMedia = await db.select().from(media).where(eq(media.category, 'music'));
    console.log("\nMusic category media:");
    console.log(JSON.stringify(musicMedia.map(m => ({ id: m.id, fileName: m.fileName, vibe: (m.metadata as any)?.vibe, altText: m.altText, category: m.category })), null, 2));
    
    const distinctCategories = await db.select({ category: media.category }).from(media).groupBy(media.category);
    console.log("\nDistinct categories:");
    console.log(JSON.stringify(distinctCategories, null, 2));

    // Also check for 'Mountain' or 'Upbeat' in any category
    const itemsLikeUser = await db.select().from(media).where(ne(media.category, 'music'));
    const filtered = itemsLikeUser.filter(m => m.fileName.includes('Mountain') || m.fileName.includes('Upbeat') || (m.altText && m.altText.includes('Mountain')) || (m.altText && m.altText.includes('Upbeat')));
    console.log("\nOther items like user requested:");
    console.log(JSON.stringify(filtered.map(m => ({ id: m.id, fileName: m.fileName, category: m.category, altText: m.altText })), null, 2));

  } catch (error) {
    console.error("Error checking media:", error);
  }
}

checkMedia();
