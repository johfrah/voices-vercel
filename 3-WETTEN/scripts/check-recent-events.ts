#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkRecentEvents() {
  try {
    const events = await db.execute(sql`
      SELECT 
        created_at,
        event_type,
        severity,
        message,
        details
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '2 hours'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log('Recent System Events (Last 2 Hours):');
    console.log('=====================================\n');
    
    if (events.rows.length === 0) {
      console.log('✅ No events in the last 2 hours - System is clean');
    } else {
      events.rows.forEach((e: any) => {
        console.log(`[${e.created_at}] ${e.severity} - ${e.event_type}`);
        console.log(`  Message: ${e.message}`);
        if (e.details) {
          const detailStr = typeof e.details === 'string' ? e.details : JSON.stringify(e.details);
          console.log(`  Details: ${detailStr.substring(0, 200)}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error checking events:', error);
    process.exit(1);
  }
}

checkRecentEvents();
