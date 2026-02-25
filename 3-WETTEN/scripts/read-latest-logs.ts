import { db } from './1-SITE/apps/web/src/lib/db';
import { systemEvents } from './1-SITE/apps/web/src/lib/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  try {
    const events = await db.select().from(systemEvents).orderBy(desc(systemEvents.createdAt)).limit(20);
    console.log(JSON.stringify(events, null, 2));
  } catch (e) {
    console.error('Failed to fetch events:', e);
  }
}

main();
