/**
 * Check system_events for recent errors
 */

import { db } from '../../1-SITE/packages/database/src/index';
import { sql } from 'drizzle-orm';

async function checkSystemEvents() {
  console.log('🔍 Checking system_events for recent errors...\n');
  
  try {
    const recentEvents = await db.execute(sql`
      SELECT 
        id,
        event_type,
        severity,
        message,
        context,
        created_at
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '2 hours'
      AND severity IN ('error', 'critical')
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    if (recentEvents.rows.length === 0) {
      console.log('✅ No errors in the last 2 hours');
      return;
    }
    
    console.log(`❌ Found ${recentEvents.rows.length} error(s):\n`);
    
    for (const event of recentEvents.rows) {
      console.log('='.repeat(60));
      console.log(`ID: ${event.id}`);
      console.log(`Type: ${event.event_type}`);
      console.log(`Severity: ${event.severity}`);
      console.log(`Time: ${event.created_at}`);
      console.log(`Message: ${event.message}`);
      if (event.context) {
        console.log(`Context:`, JSON.stringify(event.context, null, 2));
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Failed to check system_events:', error);
  }
}

checkSystemEvents();
