#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkErrors() {
  console.log('🔍 Checking for SlimmeKassa/ReferenceError events...\n');

  const events = await db.execute(sql`
    SELECT created_at, level, source, message, details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '2 hours'
    AND (message ILIKE '%SlimmeKassa%' OR message ILIKE '%ReferenceError%')
    ORDER BY created_at DESC
    LIMIT 20
  `);

  const eventRows = Array.isArray(events) ? events : (events.rows || []);
  console.log(`Found ${eventRows.length} SlimmeKassa/ReferenceError events (last 2 hours):`);
  if (eventRows.length > 0) {
    console.log(JSON.stringify(eventRows, null, 2));
  } else {
    console.log('✅ No SlimmeKassa or ReferenceError events found!');
  }

  console.log('\n\n📊 All recent events (last hour):');
  const allRecent = await db.execute(sql`
    SELECT created_at, level, source, message
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '1 hour'
    ORDER BY created_at DESC
    LIMIT 10
  `);

  const allRows = Array.isArray(allRecent) ? allRecent : (allRecent.rows || []);
  console.log(JSON.stringify(allRows, null, 2));
}

checkErrors().catch(console.error);
