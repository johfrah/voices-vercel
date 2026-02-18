import { inArray } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { media } from "../../packages/database/src/schema/index";

async function checkMedia() {
  try {
    const specificMedia = await db.select().from(media).where(
      inArray(media.id, [1511, 1395, 1512, 124, 136, 178])
    );
    
    console.log("Specific media metadata:");
    console.log(JSON.stringify(specificMedia.map(m => ({ 
      id: m.id, 
      fileName: m.fileName, 
      category: m.category, 
      metadata: m.metadata,
      labels: m.labels
    })), null, 2));

  } catch (error) {
    console.error("Error checking media:", error);
  }
}

checkMedia();
