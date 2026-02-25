import { db } from '../../1-SITE/packages/database/src/index.js';
import { system_events } from '../../1-SITE/packages/database/src/schema/index.js';
import { desc, sql, or, like } from 'drizzle-orm';

async function checkActorErrors() {
  console.log('🔍 Checking for actor-related errors...\n');

  const events = await db.select()
    .from(system_events)
    .where(
      or(
        like(system_events.message, '%actor%'),
        like(system_events.message, '%500%'),
        like(system_events.endpoint, '%/api/admin/actors%')
      )
    )
    .orderBy(desc(system_events.created_at))
    .limit(20);

  if (events.length === 0) {
    console.log('✅ No actor-related errors found in system_events');
  } else {
    console.log(`Found ${events.length} actor-related events:\n`);
    events.forEach((event, i) => {
      console.log(`${i + 1}. [${event.created_at}] ${event.severity}`);
      console.log(`   Endpoint: ${event.endpoint || 'N/A'}`);
      console.log(`   Message: ${event.message}`);
      console.log(`   Details: ${event.details ? JSON.stringify(event.details).substring(0, 200) : 'N/A'}`);
      console.log('');
    });
  }

  process.exit(0);
}

checkActorErrors().catch(console.error);
