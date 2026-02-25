#!/usr/bin/env tsx
import { db } from '../../1-SITE/apps/web/src/lib/db/index.js';
import { system_events } from '../../1-SITE/apps/web/src/lib/db/schema.js';
import { desc, like, and, gte } from 'drizzle-orm';

async function checkErrors() {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);
    
    const events = await db.select().from(system_events)
      .where(
        and(
          like(system_events.message, '%Server Component%'),
          gte(system_events.created_at, oneHourAgo)
        )
      )
      .orderBy(desc(system_events.created_at))
      .limit(10);

    console.log(`\n🔍 Server Component Errors (Last Hour):`);
    console.log(`Found ${events.length} events\n`);
    
    if (events.length === 0) {
      console.log('✅ No Server Component errors in the last hour!');
    } else {
      events.forEach((event, idx) => {
        console.log(`\n[${idx + 1}] ${event.created_at?.toISOString()}`);
        console.log(`Level: ${event.level}`);
        console.log(`Message: ${event.message}`);
        console.log(`Path: ${event.path || 'N/A'}`);
        if (event.details) {
          console.log(`Details: ${JSON.stringify(event.details, null, 2)}`);
        }
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkErrors();
