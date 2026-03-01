#!/usr/bin/env tsx
/**
 * Test Database Connection - Simple Ping
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('\n🔌 TESTING DATABASE CONNECTION\n');
  console.log('='.repeat(80));

  try {
    console.log('Attempting simple SELECT 1 query...');
    const result = await db.execute(sql`SELECT 1 as ping`);
    console.log('✅ Database connection successful!');
    console.log(`   Result: ${JSON.stringify(result.rows)}`);

    console.log('\nAttempting to count workshops...');
    const workshopCount = await db.execute(sql`SELECT COUNT(*) as count FROM workshops`);
    console.log(`✅ Workshops table accessible!`);
    console.log(`   Count: ${JSON.stringify(workshopCount.rows)}`);

    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ Connection Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

testConnection();
