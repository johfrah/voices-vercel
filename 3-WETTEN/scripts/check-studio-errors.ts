#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/index';
import { systemEvents } from '../../1-SITE/packages/database/src/schema';
import { desc, sql } from 'drizzle-orm';

async function checkStudioErrors() {
  console.log('🔍 Checking for Studio-related errors in database...\n');
  
  // Check for studio-related errors
  const studioEvents = await db.select().from(systemEvents)
    .where(sql`${systemEvents.message} ILIKE '%studio%' OR ${systemEvents.context}::text ILIKE '%studio%'`)
    .orderBy(desc(systemEvents.createdAt))
    .limit(20);
  
  console.log(`Found ${studioEvents.length} studio-related events:\n`);
  
  studioEvents.forEach((event, idx) => {
    console.log(`${idx + 1}. [${event.severity}] ${event.message}`);
    console.log(`   Time: ${event.createdAt}`);
    if (event.context) {
      console.log(`   Context: ${JSON.stringify(event.context).substring(0, 200)}`);
    }
    console.log('');
  });
  
  // Check for recent errors (last hour)
  const recentErrors = await db.select().from(systemEvents)
    .where(sql`${systemEvents.severity} IN ('error', 'critical') AND ${systemEvents.createdAt} > NOW() - INTERVAL '1 hour'`)
    .orderBy(desc(systemEvents.createdAt))
    .limit(10);
  
  console.log(`\nRecent errors (last hour): ${recentErrors.length}\n`);
  
  recentErrors.forEach((event, idx) => {
    console.log(`${idx + 1}. [${event.severity}] ${event.message}`);
    console.log(`   Time: ${event.createdAt}`);
    if (event.stackTrace) {
      console.log(`   Stack: ${event.stackTrace.substring(0, 200)}...`);
    }
    console.log('');
  });
}

checkStudioErrors().catch(console.error);
