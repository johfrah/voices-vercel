#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkHydrationDigest() {
  const digest = '2638643664';
  
  try {
    console.log(`🔍 Checking for hydration digest: ${digest}\n`);
    
    const result = await db.execute(sql`
      SELECT event_type, message, metadata, created_at, stack_trace
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '24 hours'
        AND (message ILIKE '%${sql.raw(digest)}%' OR metadata::text ILIKE '%${sql.raw(digest)}%')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (result.rows.length === 0) {
      console.log('✅ No system events found for this digest in the last 24 hours');
      console.log('   This suggests the hydration error is benign or already resolved.');
    } else {
      console.log(`⚠️  Found ${result.rows.length} events with this digest:\n`);
      result.rows.forEach((row: any, idx: number) => {
        console.log(`${idx + 1}. [${row.created_at}] ${row.event_type}`);
        console.log(`   Message: ${row.message}`);
        if (row.metadata) {
          console.log(`   Metadata: ${JSON.stringify(row.metadata, null, 2)}`);
        }
        if (row.stack_trace) {
          console.log(`   Stack: ${row.stack_trace.substring(0, 200)}...`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error checking digest:', error);
    process.exit(1);
  }
  process.exit(0);
}

checkHydrationDigest();
