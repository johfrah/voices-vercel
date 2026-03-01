#!/usr/bin/env tsx
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

async function checkLiveStatus() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Checking live status...\n');

  // Check recent errors
  const events = await db.execute(sql`
    SELECT created_at, source, level, message, details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '2 hours'
    AND level IN ('error', 'critical')
    ORDER BY created_at DESC
    LIMIT 10
  `);

  console.log(`📊 Recent errors (last 2 hours): ${events.length}`);
  
  if (events.length > 0) {
    console.log('\n⚠️  ERRORS FOUND:\n');
    events.forEach((e: any) => {
      console.log(`[${e.level.toUpperCase()}] ${e.source}`);
      console.log(`  Message: ${e.message}`);
      console.log(`  Time: ${e.created_at}`);
      if (e.details) {
        const details = typeof e.details === 'string' ? JSON.parse(e.details) : e.details;
        console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ No errors found in system_events\n');
  }

  // Check for wp-content related errors
  const wpContentErrors = await db.execute(sql`
    SELECT created_at, message, details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '2 hours'
    AND (message LIKE '%wp-content%' OR message LIKE '%wp-includes%')
    ORDER BY created_at DESC
    LIMIT 5
  `);

  console.log(`🔍 Legacy asset errors (wp-content/wp-includes): ${wpContentErrors.length}`);
  
  if (wpContentErrors.length > 0) {
    console.log('\n⚠️  LEGACY ASSET ERRORS:\n');
    wpContentErrors.forEach((e: any) => {
      console.log(`  ${e.created_at}: ${e.message}`);
    });
  } else {
    console.log('✅ No legacy asset errors found\n');
  }

  await client.end();
}

checkLiveStatus().catch(console.error);
