import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { actors } from '../../1-SITE/packages/database/schema';
import { eq } from 'drizzle-orm';

async function checkActor() {
  const id = 234808;
  console.log(`Checking actor ${id}...`);
  try {
    const result = await db.select().from(actors).where(eq(actors.wpProductId, id)).limit(1);
    console.log('Actor data:', JSON.stringify(result[0], null, 2));
  } catch (e) {
    console.error('Error fetching actor:', e);
  }
  process.exit(0);
}

checkActor();
