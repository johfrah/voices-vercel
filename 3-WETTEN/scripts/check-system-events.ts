#!/usr/bin/env tsx
import dotenv from 'dotenv';
import path from 'path';
import { db, systemEvents } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { desc } from 'drizzle-orm';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function checkEvents() {
  const events = await db.select().from(systemEvents).orderBy(desc(systemEvents.createdAt)).limit(10);
  console.log('📊 Last 10 system events:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (events.length === 0) {
    console.log('✅ No recent errors');
  } else {
    events.forEach(e => {
      console.log(`[${e.severity}] ${e.eventType} - ${e.message}`);
      console.log(`   Time: ${e.createdAt}`);
      console.log('');
    });
  }
}

checkEvents().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
