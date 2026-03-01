#!/usr/bin/env tsx
/**
 * Check for SlimmeKassa errors in system_events
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkErrors() {
  try {
    const result = await db.execute(sql`
      SELECT created_at, level, source, message, details
      FROM system_events
      WHERE message ILIKE '%SlimmeKassa%'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('🔍 Recent SlimmeKassa Errors:');
    console.log('');
    
    if (!result.rows || result.rows.length === 0) {
      console.log('✅ No SlimmeKassa errors found in system_events!');
    } else {
      console.log(`Found ${result.rows.length} errors:`);
      result.rows.forEach((row: any, idx: number) => {
        console.log(`\n${idx + 1}. ${row.created_at}`);
        console.log(`   Level: ${row.level}`);
        console.log(`   Source: ${row.source}`);
        console.log(`   Message: ${row.message?.substring(0, 200)}`);
        if (row.details) {
          console.log(`   Details: ${JSON.stringify(row.details).substring(0, 200)}`);
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
