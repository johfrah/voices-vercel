import { eq, ilike, or } from 'drizzle-orm';
import { db } from './1-SITE/apps/web/src/lib/sync/bridge';
import { actors } from './1-SITE/packages/database/schema';

async function checkBirgitPhoto() {
  console.log("🔍 Checking Birgit photos in database...");
  
  const results = await db.select({
    id: actors.id,
    wpProductId: actors.wpProductId,
    firstName: actors.firstName,
    lastName: actors.lastName,
    photoId: actors.photoId,
    photoUrl: actors.dropboxUrl,
    status: actors.status
  })
  .from(actors)
  .where(or(
    ilike(actors.firstName, 'Birgit%'),
    eq(actors.wpProductId, 189009),
    eq(actors.wpProductId, 207644)
  ));

  console.log("Results:", JSON.stringify(results, null, 2));
}

checkBirgitPhoto().catch(console.error);
