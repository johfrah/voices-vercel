#!/usr/bin/env tsx
/**
 * 🔍 Server Component Error Checker (Simplified)
 * 
 * Direct database query to check for Server Component errors
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { systemEvents } from '@voices/database/schema';
import { desc, gte } from 'drizzle-orm';

async function checkServerComponentErrors() {
  console.log('🔍 CHECKING SERVER COMPONENT ERRORS\n');
  console.log('=' .repeat(60));
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }
  
  const client = postgres(connectionString, { ssl: 'require' });
  const db = drizzle(client);
  
  try {
    // Check recent system_events (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const recentEvents = await db
      .select()
      .from(systemEvents)
      .where(gte(systemEvents.createdAt, twoHoursAgo))
      .orderBy(desc(systemEvents.createdAt))
      .limit(50);
    
    console.log(`\n📊 Recent Events (last 2 hours): ${recentEvents.length}\n`);
    
    const errors = recentEvents.filter(e => e.level === 'error' || e.level === 'critical');
    const serverComponentErrors = errors.filter(e => 
      e.message?.includes('Server Components') || 
      e.message?.includes('Minified React error #419') ||
      e.message?.includes('Cannot access') ||
      e.source === 'admin_orders_new_page'
    );
    
    if (serverComponentErrors.length > 0) {
      console.log('❌ SERVER COMPONENT ERRORS DETECTED:\n');
      serverComponentErrors.forEach((event, i) => {
        console.log(`${i + 1}. [${event.level}] ${event.source}`);
        console.log(`   Time: ${event.createdAt}`);
        console.log(`   Message: ${event.message?.substring(0, 200)}`);
        console.log(`   Details: ${JSON.stringify(event.details || {}).substring(0, 150)}`);
        console.log('');
      });
    } else {
      console.log('✅ No Server Component errors in last 2 hours\n');
    }
    
    if (errors.length > serverComponentErrors.length) {
      console.log(`⚠️  Other errors: ${errors.length - serverComponentErrors.length}\n`);
      errors
        .filter(e => !serverComponentErrors.includes(e))
        .slice(0, 5)
        .forEach((event, i) => {
          console.log(`${i + 1}. [${event.level}] ${event.source}`);
          console.log(`   Message: ${event.message?.substring(0, 150)}`);
          console.log('');
        });
    }
    
    console.log('=' .repeat(60));
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total events: ${recentEvents.length}`);
    console.log(`   Server Component errors: ${serverComponentErrors.length}`);
    console.log(`   Other errors: ${errors.length - serverComponentErrors.length}`);
    console.log(`   Clean events: ${recentEvents.length - errors.length}`);
    
    await client.end();
    
    if (serverComponentErrors.length > 0) {
      console.log('\n❌ VERIFICATION FAILED: Server Component errors detected');
      process.exit(1);
    } else {
      console.log('\n✅ VERIFICATION PASSED: No critical errors');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Database query failed:', error);
    await client.end();
    process.exit(1);
  }
}

checkServerComponentErrors();
