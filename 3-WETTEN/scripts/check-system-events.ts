#!/usr/bin/env tsx
import 'dotenv/config';
import { db } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function checkEvents() {
  const events = await db.execute(sql`
    SELECT event_type, message, created_at 
    FROM system_events 
    ORDER BY created_at DESC 
    LIMIT 10
  `);

  console.log('🔍 Recent System Events (Last 10):');
  console.log('');
  
  if (events.rows.length === 0) {
    console.log('✅ No recent system events found.');
    return;
  }

  events.rows.forEach((e: any) => {
    const timestamp = new Date(e.created_at).toISOString();
    const message = e.message?.substring(0, 150) || 'No message';
    console.log(`[${timestamp}] ${e.event_type}`);
    console.log(`  ${message}`);
    console.log('');
  });
}

checkEvents().catch(console.error);
