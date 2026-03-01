#!/usr/bin/env tsx
/**
 * Inspect workshop_editions schema
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function inspectSchema() {
  console.log('\n🔍 INSPECTING workshop_editions SCHEMA\n');
  console.log('='.repeat(80));

  try {
    // Get column information
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'workshop_editions'
      ORDER BY ordinal_position
    `);

    const columns = Array.isArray(result) ? result : (result as any).rows || [];
    
    console.log(`\n✅ Found ${columns.length} columns:\n`);
    columns.forEach((col: any) => {
      console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Try a simple query
    console.log('\n📊 Testing simple query...');
    const testResult = await db.execute(sql`
      SELECT id, workshop_id, date, status
      FROM workshop_editions
      LIMIT 3
    `);
    
    const rows = Array.isArray(testResult) ? testResult : (testResult as any).rows || [];
    console.log(`✅ Query successful! Found ${rows.length} rows.`);
    rows.forEach((row: any) => {
      console.log(`   Edition ${row.id}: workshop_id=${row.workshop_id}, date=${row.date}, status=${row.status}`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

inspectSchema();
