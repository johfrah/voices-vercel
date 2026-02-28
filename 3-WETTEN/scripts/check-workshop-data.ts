#!/usr/bin/env tsx
/**
 * Check Workshop Data in Database
 */

import dotenv from 'dotenv';
import path from 'path';
import { db } from '../../1-SITE/apps/web/src/lib/system/db.js';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../1-SITE/apps/web/.env.local') });

async function main() {
  console.log('📅 Checking Workshop Editions in Database...\n');

  const result = await db.execute(sql`
    SELECT 
      id,
      title,
      start_time,
      end_time,
      location,
      max_participants,
      price_excl_vat,
      status
    FROM workshop_editions
    WHERE status = 'published'
      AND start_time >= NOW()
    ORDER BY start_time ASC
    LIMIT 5
  `);

  if (result.rows.length === 0) {
    console.log('❌ No upcoming published workshops found in database');
    console.log('This explains why Voicy cannot provide specific dates.\n');
  } else {
    console.log(`✅ Found ${result.rows.length} upcoming workshop(s):\n`);
    result.rows.forEach((row: any) => {
      console.log(`📍 ${row.title}`);
      console.log(`   Start: ${row.start_time}`);
      console.log(`   End: ${row.end_time}`);
      console.log(`   Location: ${row.location || 'N/A'}`);
      console.log(`   Price: €${row.price_excl_vat} (excl. VAT)`);
      console.log(`   Status: ${row.status}`);
      console.log('');
    });
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
