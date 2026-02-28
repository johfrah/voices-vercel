import { db } from '../../1-SITE/packages/database/src/index.js';
import { systemEvents } from '../../1-SITE/packages/database/src/schema/index.js';
import { desc } from 'drizzle-orm';

async function checkSystemEvents() {
  try {
    const events = await db.select().from(systemEvents).orderBy(desc(systemEvents.created_at)).limit(20);
    
    console.log('🔍 Latest System Events:');
    console.log('========================\n');
    
    if (events.length === 0) {
      console.log('✅ No system events found.');
      return;
    }
    
    const errors = events.filter(e => e.severity === 'error');
    const warnings = events.filter(e => e.severity === 'warning');
    
    console.log(`📊 Summary: ${errors.length} errors, ${warnings.length} warnings\n`);
    
    events.forEach((event, i) => {
      const icon = event.severity === 'error' ? '❌' : event.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} [${event.severity?.toUpperCase()}] ${event.event_type}`);
      console.log(`   Time: ${event.created_at}`);
      console.log(`   Message: ${event.message}`);
      if (event.details) {
        console.log(`   Details: ${JSON.stringify(event.details).substring(0, 200)}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch system events:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

checkSystemEvents();
