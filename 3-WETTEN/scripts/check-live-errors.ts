#!/usr/bin/env tsx
/**
 * Check Live Errors - Direct Database Inspection
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkLiveErrors() {
  console.log('\n🔍 LIVE ERROR CHECK\n');
  console.log('='.repeat(80));

  try {
    const result = await db.execute(sql`
      SELECT event_type, message, metadata, created_at
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '10 minutes'
        AND event_type IN ('error', 'critical')
      ORDER BY created_at DESC
      LIMIT 20
    `);

    const events = result.rows || [];
    
    if (events.length === 0) {
      console.log('\n✅ No errors in the last 10 minutes');
    } else {
      console.log(`\n⚠️  Found ${events.length} errors:\n`);
      events.forEach((row: any) => {
        console.log(`[${row.created_at}] ${row.event_type}: ${row.message}`);
        if (row.metadata) {
          console.log(`   Metadata: ${JSON.stringify(row.metadata, null, 2)}`);
        }
        console.log('');
      });
    }

    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ Database Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

checkLiveErrors();
