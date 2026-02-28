#!/usr/bin/env tsx
/**
 * Check recent system_events for errors
 */

import { db } from '../../1-SITE/packages/database/src';
import { sql } from 'drizzle-orm';

async function checkSystemEvents() {
  console.log('🔍 Checking recent system_events...\n');
  
  try {
    const recentEvents = await db.execute(sql`
      SELECT 
        event_type,
        severity,
        message,
        details,
        created_at
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    if (recentEvents.rows.length === 0) {
      console.log('✅ No system events in the last hour');
      return;
    }
    
    console.log(`Found ${recentEvents.rows.length} events in the last hour:\n`);
    
    for (const event of recentEvents.rows) {
      const severity = event.severity as string;
      const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} [${severity.toUpperCase()}] ${event.event_type}`);
      console.log(`   Message: ${event.message}`);
      console.log(`   Time: ${event.created_at}`);
      if (event.details) {
        console.log(`   Details: ${JSON.stringify(event.details).substring(0, 200)}`);
      }
      console.log('');
    }
    
    // Count by severity
    const errorCount = recentEvents.rows.filter(e => e.severity === 'error').length;
    const warningCount = recentEvents.rows.filter(e => e.severity === 'warning').length;
    
    console.log('\n📊 Summary:');
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Warnings: ${warningCount}`);
    console.log(`   Total: ${recentEvents.rows.length}`);
    
  } catch (error) {
    console.error('❌ Failed to check system events:', error);
  }
  
  process.exit(0);
}

checkSystemEvents();
