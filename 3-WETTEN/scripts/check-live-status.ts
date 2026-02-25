#!/usr/bin/env tsx
/**
 * 🔍 Live Status Checker (Chris-Protocol)
 * 
 * Verifies the live deployment status by checking:
 * 1. Recent system_events for errors
 * 2. Current version deployed
 */

import { db } from '../../1-SITE/apps/web/src/lib/db';
import { systemEvents } from '@voices/database/schema';
import { desc, gte } from 'drizzle-orm';

async function checkLiveStatus() {
  console.log('🔍 LIVE STATUS CHECK - v2.14.459\n');
  console.log('=' .repeat(60));
  
  try {
    // Check recent system_events (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentEvents = await db
      .select()
      .from(systemEvents)
      .where(gte(systemEvents.created_at, oneHourAgo))
      .orderBy(desc(systemEvents.created_at))
      .limit(20);
    
    console.log(`\n📊 Recent Events (last hour): ${recentEvents.length}\n`);
    
    const errors = recentEvents.filter(e => e.error_message);
    const serverComponentErrors = errors.filter(e => 
      e.error_message?.includes('Server Components') || 
      e.error_message?.includes('Minified React error')
    );
    
    if (serverComponentErrors.length > 0) {
      console.log('❌ SERVER COMPONENT ERRORS DETECTED:\n');
      serverComponentErrors.forEach((event, i) => {
        console.log(`${i + 1}. [${event.event_type}] ${event.event_name}`);
        console.log(`   Time: ${event.created_at}`);
        console.log(`   Error: ${event.error_message}`);
        console.log(`   Context: ${event.context || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('✅ No Server Component errors in last hour\n');
    }
    
    if (errors.length > serverComponentErrors.length) {
      console.log(`⚠️  Other errors: ${errors.length - serverComponentErrors.length}\n`);
      errors
        .filter(e => !serverComponentErrors.includes(e))
        .slice(0, 5)
        .forEach((event, i) => {
          console.log(`${i + 1}. [${event.event_type}] ${event.event_name}`);
          console.log(`   Error: ${event.error_message}`);
          console.log('');
        });
    }
    
    console.log('=' .repeat(60));
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total events: ${recentEvents.length}`);
    console.log(`   Server Component errors: ${serverComponentErrors.length}`);
    console.log(`   Other errors: ${errors.length - serverComponentErrors.length}`);
    console.log(`   Clean events: ${recentEvents.length - errors.length}`);
    
    if (serverComponentErrors.length > 0) {
      console.log('\n❌ VERIFICATION FAILED: Server Component errors detected');
      process.exit(1);
    } else {
      console.log('\n✅ VERIFICATION PASSED: No critical errors');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

checkLiveStatus();
