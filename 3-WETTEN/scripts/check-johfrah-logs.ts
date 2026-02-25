#!/usr/bin/env tsx
import { db, systemEvents } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { desc, and, gte, like, or } from 'drizzle-orm';

async function main() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // Last 30 minutes

  console.log('🔍 Checking Johfrah route logs from the last 30 minutes...\n');

  const logs = await db.select()
    .from(systemEvents)
    .where(and(
      gte(systemEvents.timestamp, cutoff),
      or(
        like(systemEvents.context, '%johfrah%'),
        like(systemEvents.message, '%johfrah%')
      )
    ))
    .orderBy(desc(systemEvents.timestamp))
    .limit(20);

  if (logs.length === 0) {
    console.log('✅ No Johfrah-related logs found in the last 30 minutes.');
  } else {
    console.log(`📊 Found ${logs.length} Johfrah-related log entries:\n`);
    logs.forEach((log, idx) => {
      console.log(`[${idx + 1}] ${log.timestamp.toISOString()}`);
      console.log(`    Level: ${log.level}`);
      console.log(`    Message: ${log.message}`);
      console.log(`    Context: ${log.context}`);
      if (log.metadata) {
        console.log(`    Metadata: ${JSON.stringify(log.metadata, null, 2)}`);
      }
      console.log('');
    });
  }

  // Also check for any recent errors
  console.log('\n🚨 Checking for recent errors (any route)...\n');
  
  const errors = await db.select()
    .from(systemEvents)
    .where(and(
      gte(systemEvents.timestamp, cutoff),
      like(systemEvents.level, 'error')
    ))
    .orderBy(desc(systemEvents.timestamp))
    .limit(10);

  if (errors.length === 0) {
    console.log('✅ No errors found in the last 30 minutes.');
  } else {
    console.log(`⚠️ Found ${errors.length} error entries:\n`);
    errors.forEach((error, idx) => {
      console.log(`[${idx + 1}] ${error.timestamp.toISOString()}`);
      console.log(`    Message: ${error.message}`);
      console.log(`    Context: ${error.context}`);
      console.log('');
    });
  }

  process.exit(0);
}

main().catch(console.error);
