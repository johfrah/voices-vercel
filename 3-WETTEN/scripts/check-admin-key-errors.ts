#!/usr/bin/env tsx
import { db } from '../../1-SITE/apps/web/src/lib/core-internal/database/index.ts';
import { sql } from 'drizzle-orm';

async function checkErrors() {
  console.log('🔍 Checking for admin-key related errors...\n');

  const result = await db.execute(sql`
    SELECT 
      id,
      event_type,
      severity,
      message,
      created_at,
      meta_data
    FROM system_events 
    WHERE created_at > NOW() - INTERVAL '1 hour'
      AND (
        message ILIKE '%admin-key%'
        OR message ILIKE '%/api/auth/%'
        OR event_type = 'error'
      )
    ORDER BY created_at DESC 
    LIMIT 10
  `);

  if (result.rows.length === 0) {
    console.log('✅ No recent errors found');
  } else {
    console.log(`Found ${result.rows.length} events:\n`);
    result.rows.forEach((row: any) => {
      console.log('---');
      console.log('Time:', row.created_at);
      console.log('Type:', row.event_type);
      console.log('Severity:', row.severity);
      console.log('Message:', row.message);
      if (row.meta_data) {
        console.log('Meta:', JSON.stringify(row.meta_data, null, 2));
      }
    });
  }

  process.exit(0);
}

checkErrors();
