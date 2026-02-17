import { db } from './src/lib/sync/bridge.ts';
import { media } from '../../packages/database/schema.ts';
import { ilike, or } from 'drizzle-orm';

async function checkMedia() {
  console.log("🔍 Checking media in database...");
  try {
    const results = await db.select({
      id: media.id,
      fileName: media.fileName,
      filePath: media.filePath
    })
    .from(media)
    .where(or(
      ilike(media.fileName, '%birgit%'),
      ilike(media.fileName, '%christina%')
    ));

    console.log("Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Database error:", error);
  }
}

checkMedia().catch(console.error);
