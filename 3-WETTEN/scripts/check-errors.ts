import { db } from '../1-SITE/packages/database';
import { systemEvents } from '../1-SITE/packages/database/schema';
import { desc } from 'drizzle-orm';

async function checkErrors() {
  console.log('🔍 Checking recent system events...');
  try {
    const events = await db.select()
      .from(systemEvents)
      .where((table) => ({
        level: 'error'
      }))
      .orderBy(desc(systemEvents.createdAt))
      .limit(10);
    
    console.log('Recent Errors:');
    console.log(JSON.stringify(events, null, 2));
  } catch (err) {
    console.error('Failed to fetch events:', err);
  }
}

checkErrors();
