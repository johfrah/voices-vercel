import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function checkStudioWorkshops() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Checking Studio Workshops...\n');

  // Check workshop editions
  const editions = await db.execute(sql`
    SELECT id, title, date, end_date, status
    FROM workshop_editions
    WHERE status IN ('upcoming', 'open')
    ORDER BY date DESC
    LIMIT 10
  `);
  
  console.log(`📊 Open workshop editions: ${editions.length}\n`);
  if (editions.length > 0) {
    console.log('Recent editions:');
    editions.forEach((e: any) => {
      console.log(`  - ${e.title} (${e.date}) - Status: ${e.status}`);
    });
  }

  // Check system_events for errors
  const recentErrors = await db.execute(sql`
    SELECT created_at, level, source, message
    FROM system_events 
    WHERE level IN ('error', 'critical')
    AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC 
    LIMIT 10
  `);

  console.log(`\n📋 Recent errors in last 24h: ${recentErrors.length}`);
  if (recentErrors.length > 0) {
    recentErrors.forEach((e: any) => {
      console.log(`\n  Time: ${e.created_at}`);
      console.log(`  Level: ${e.level}`);
      console.log(`  Source: ${e.source}`);
      console.log(`  Message: ${e.message}`);
    });
  } else {
    console.log('✅ No recent errors found');
  }

  await client.end();
}

checkStudioWorkshops().catch(console.error);
