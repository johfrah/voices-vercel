import { db } from '../../1-SITE/apps/web/src/lib/db';
import { system_events } from '@voices/database/schema';
import { desc, eq } from 'drizzle-orm';

async function checkErrors() {
  const events = await db.select()
    .from(system_events)
    .where(eq(system_events.event_type, 'error'))
    .orderBy(desc(system_events.created_at))
    .limit(10);

  console.log('=== LAATSTE 10 ERRORS ===\n');
  
  for (const event of events) {
    console.log(`[${event.created_at}] ${event.event_name}`);
    console.log(`Context: ${event.context}`);
    if (event.details) {
      console.log(`Details: ${JSON.stringify(event.details, null, 2)}`);
    }
    console.log('---\n');
  }
  
  process.exit(0);
}

checkErrors();
