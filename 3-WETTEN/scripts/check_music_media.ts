import { eq } from "drizzle-orm";
import { db } from "./1-SITE/packages/database/src/index";
import { media } from "./1-SITE/packages/database/src/schema/index";

async function checkMedia() {
  try {
    const allMedia = await db.select().from(media).limit(50);
    console.log("All media (first 50):");
    console.log(JSON.stringify(allMedia.map(m => ({ id: m.id, fileName: m.fileName, category: m.category, altText: m.altText })), null, 2));

    const musicMedia = await db.select().from(media).where(eq(media.category, 'music'));
    console.log("\nMusic category media:");
    console.log(JSON.stringify(musicMedia.map(m => ({ id: m.id, fileName: m.fileName, vibe: (m.metadata as any)?.vibe, altText: m.altText })), null, 2));
    
    const distinctCategories = await db.select({ category: media.category }).from(media).groupBy(media.category);
    console.log("\nDistinct categories:");
    console.log(JSON.stringify(distinctCategories, null, 2));

  } catch (error) {
    console.error("Error checking media:", error);
  }
}

checkMedia();
