import { db } from '../packages/database';
import { systemEvents } from '../packages/database/schema';
import { desc, eq } from 'drizzle-orm';

async function checkErrors() {
  console.log('🔍 Checking recent system events...');
  try {
    const events = await db.select()
      .from(systemEvents)
      .where(eq(systemEvents.level, 'error'))
      .orderBy(desc(systemEvents.createdAt))
      .limit(10);
    
    console.log('Recent Errors:');
    console.log(JSON.stringify(events, null, 2));
  } catch (err) {
    console.error('Failed to fetch events:', err);
  }
}

checkErrors();
