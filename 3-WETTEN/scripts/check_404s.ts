import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

// We need to use the actual paths since we're running this with tsx from the root
import { db } from './1-SITE/packages/database/src/index';
import { systemEvents } from './1-SITE/packages/database/src/schema';
import { desc, like } from 'drizzle-orm';

async function check404s() {
  console.log('🔍 Zoeken naar recente 404 fouten...');
  try {
    const events = await db.select()
      .from(systemEvents)
      .where(like(systemEvents.message, '404 Error%'))
      .orderBy(desc(systemEvents.createdAt))
      .limit(20);

    if (events.length === 0) {
      console.log('✅ Geen recente 404 fouten gevonden in de database.');
      return;
    }

    console.log(`\nFound ${events.length} recent 404 errors:\n`);
    events.forEach(event => {
      const details = event.details as any;
      console.log(`- [${event.createdAt?.toLocaleString()}] Path: ${details?.path || 'unknown'}`);
      console.log(`  Referrer: ${details?.referrer || 'none'}`);
      console.log(`  Message: ${event.message}\n`);
    });
  } catch (error) {
    console.error('❌ Fout bij het ophalen van 404s:', error);
  }
}

check404s();
