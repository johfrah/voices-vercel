#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkStudioEvents() {
  try {
    const result = await db.execute(sql`
      SELECT event_type, message, metadata, created_at
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '2 hours'
        AND (message ILIKE '%studio%' OR message ILIKE '%quiz%' OR message ILIKE '%workshop%' OR message ILIKE '%hydration%')
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (result.rows.length === 0) {
      console.log('✅ No Studio-related errors in the last 2 hours');
    } else {
      console.log(`⚠️  Found ${result.rows.length} Studio-related events:\n`);
      result.rows.forEach((row: any) => {
        console.log(`[${row.created_at}] ${row.event_type}: ${row.message}`);
        if (row.metadata) {
          console.log(`   Metadata: ${JSON.stringify(row.metadata, null, 2)}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error checking events:', error);
    process.exit(1);
  }
  process.exit(0);
}

checkStudioEvents();
