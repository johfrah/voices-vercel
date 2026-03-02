#!/usr/bin/env tsx
/**
 * Check recent system events related to Studio page errors
 */

import 'dotenv/config';
import { db } from '../../1-SITE/apps/web/src/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function checkStudioErrors() {
  console.log('\n🔍 CHECKING RECENT SYSTEM EVENTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const events = await db.execute(sql`
    SELECT 
      id,
      event_type,
      severity,
      message,
      context,
      created_at
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '2 hours'
    ORDER BY created_at DESC
    LIMIT 20
  `);

  if (events.rows.length === 0) {
    console.log('✅ No recent system events found\n');
    return;
  }

  console.log(`Found ${events.rows.length} recent events:\n`);
  
  events.rows.forEach((e: any, i: number) => {
    console.log(`${i+1}. [${e.severity}] ${e.event_type}`);
    console.log(`   Message: ${e.message}`);
    
    if (e.context) {
      try {
        const ctx = typeof e.context === 'string' ? JSON.parse(e.context) : e.context;
        if (ctx.error) {
          console.log(`   Error: ${ctx.error.substring(0, 200)}`);
        }
        if (ctx.stack) {
          const stackLines = ctx.stack.split('\n').slice(0, 3);
          console.log(`   Stack: ${stackLines.join('\n          ')}`);
        }
        if (ctx.url) {
          console.log(`   URL: ${ctx.url}`);
        }
      } catch (err) {
        console.log(`   Context: ${JSON.stringify(e.context).substring(0, 100)}`);
      }
    }
    
    console.log(`   Time: ${e.created_at}`);
    console.log('');
  });
}

checkStudioErrors().catch(console.error);
