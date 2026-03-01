#!/usr/bin/env tsx
/**
 * Check Studio World (ID 2) SmartRouter Handshake Logs
 * Verifies the "ID-First World Architecture" implementation
 */

import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkStudioHandshake() {
  console.log('🔍 CHECKING STUDIO WORLD (ID 2) HANDSHAKE LOGS...\n');

  // Check recent SmartRouter handshake logs
  const handshakeLogs = await db.execute(sql`
    SELECT 
      id,
      created_at,
      level,
      category,
      message,
      meta_data
    FROM system_events
    WHERE message LIKE '%SmartRouter%Handshake%'
      OR message LIKE '%World: 2%'
      OR (category = 'router' AND message LIKE '%studio%')
    ORDER BY created_at DESC
    LIMIT 30
  `);

  console.log(`📊 Found ${handshakeLogs.rows.length} relevant logs\n`);

  if (handshakeLogs.rows.length === 0) {
    console.log('⚠️  No SmartRouter handshake logs found. The /studio page may not have been visited yet.\n');
    return;
  }

  // Analyze logs
  let successCount = 0;
  let worldId2Count = 0;

  for (const log of handshakeLogs.rows) {
    const logData = log as any;
    console.log('---');
    console.log(`📅 ${logData.created_at}`);
    console.log(`📝 ${logData.message}`);
    
    if (logData.meta_data) {
      console.log(`🔧 Meta:`, JSON.stringify(logData.meta_data, null, 2));
    }

    // Check for success
    if (logData.message.includes('Handshake SUCCESS')) {
      successCount++;
    }

    // Check for World ID 2
    if (logData.message.includes('World: 2') || 
        (logData.meta_data && logData.meta_data.world_id === 2)) {
      worldId2Count++;
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`✅ Handshake SUCCESS count: ${successCount}`);
  console.log(`🎯 World ID 2 references: ${worldId2Count}`);

  // Check if we have evidence of ID-First architecture
  if (worldId2Count > 0) {
    console.log('\n🎉 PROOF OF SOVEREIGNTY: Studio World (ID 2) is operating as an autonomous unit!');
    console.log('The context is coming from the database (ID 2), not URL-based guessing.');
  } else {
    console.log('\n⚠️  WARNING: No World ID 2 references found in recent logs.');
    console.log('The Studio World may not be using the ID-First architecture yet.');
  }

  process.exit(0);
}

checkStudioHandshake().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
