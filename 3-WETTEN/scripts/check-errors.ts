import { db } from '@db';
import { systemEvents } from '@db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  try {
    const events = await db.select().from(systemEvents).orderBy(desc(systemEvents.createdAt)).limit(5);
    console.log(JSON.stringify(events, null, 2));
  } catch (e) {
    console.error('Error fetching events:', e);
  }
}
main();
