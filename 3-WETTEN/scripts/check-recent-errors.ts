import { db } from '../../1-SITE/packages/database/index.js';
import { systemEvents } from '../../1-SITE/packages/database/schema.js';
import { desc, and, gte, like } from 'drizzle-orm';

async function checkRecentErrors() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const errors = await db.select()
    .from(systemEvents)
    .where(and(
      gte(systemEvents.timestamp, fiveMinutesAgo),
      like(systemEvents.event_type, '%error%')
    ))
    .orderBy(desc(systemEvents.timestamp))
    .limit(10);

  console.log(`\n🔍 Recent errors (last 5 min): ${errors.length}\n`);
  
  if (errors.length === 0) {
    console.log('✅ No errors found in the last 5 minutes.');
  } else {
    errors.forEach(e => {
      console.log(`[${e.timestamp}] ${e.event_type}`);
      console.log(`   ${e.details?.message || JSON.stringify(e.details).slice(0, 200)}\n`);
    });
  }

  // Check specifically for useVoicesState errors
  const useVoicesStateErrors = await db.select()
    .from(systemEvents)
    .where(and(
      gte(systemEvents.timestamp, fiveMinutesAgo),
      like(systemEvents.event_type, '%useVoicesState%')
    ))
    .orderBy(desc(systemEvents.timestamp))
    .limit(5);

  if (useVoicesStateErrors.length > 0) {
    console.log(`\n⚠️  useVoicesState errors found: ${useVoicesStateErrors.length}`);
    useVoicesStateErrors.forEach(e => {
      console.log(`   ${e.details?.message || JSON.stringify(e.details)}`);
    });
  }
}

checkRecentErrors().catch(console.error);
