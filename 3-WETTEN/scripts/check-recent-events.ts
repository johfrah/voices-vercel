import { db } from '../../1-SITE/packages/database/index.js';
import { system_events } from '../../1-SITE/packages/database/schema/system-events.js';
import { desc } from 'drizzle-orm';

async function checkRecentEvents() {
  const events = await db
    .select()
    .from(system_events)
    .orderBy(desc(system_events.created_at))
    .limit(20);

  console.log('Recent System Events (Last 20):');
  console.log('================================\n');
  
  events.forEach(e => {
    console.log(`[${e.severity}] ${e.event_type} - ${e.message?.substring(0, 100)}`);
    console.log(`  Time: ${e.created_at}`);
    if (e.context) {
      console.log(`  Context: ${JSON.stringify(e.context).substring(0, 150)}`);
    }
    console.log('---\n');
  });

  process.exit(0);
}

checkRecentEvents();
