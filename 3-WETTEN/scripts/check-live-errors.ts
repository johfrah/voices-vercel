import { db } from './1-SITE/apps/web/src/lib/db';
import { systemEvents } from './1-SITE/apps/web/src/lib/db/schema';
import { desc, and, gte } from 'drizzle-orm';

async function checkLiveErrors() {
  try {
    // Get events from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const events = await db
      .select()
      .from(systemEvents)
      .where(gte(systemEvents.created_at, oneHourAgo))
      .orderBy(desc(systemEvents.created_at))
      .limit(20);

    console.log(`\n🔍 Recent System Events (last hour):\n`);
    
    if (events.length === 0) {
      console.log('✅ No errors in the last hour');
      return;
    }

    events.forEach((event, idx) => {
      console.log(`\n${idx + 1}. [${event.severity}] ${event.event_type}`);
      console.log(`   Time: ${event.created_at}`);
      console.log(`   Path: ${event.path || 'N/A'}`);
      console.log(`   Message: ${event.message}`);
      if (event.details) {
        console.log(`   Details: ${JSON.stringify(event.details, null, 2)}`);
      }
    });

    const errorCount = events.filter(e => e.severity === 'error').length;
    console.log(`\n📊 Summary: ${errorCount} errors, ${events.length - errorCount} warnings/info`);
    
  } catch (error) {
    console.error('❌ Failed to fetch events:', error);
    process.exit(1);
  }
}

checkLiveErrors();
