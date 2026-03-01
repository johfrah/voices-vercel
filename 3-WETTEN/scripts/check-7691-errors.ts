import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function check7691Errors() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Checking for 7691 errors in system_events...\n');

  const count = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM system_events 
    WHERE error_code = '7691' 
    AND created_at > NOW() - INTERVAL '24 hours'
  `);
  
  console.log(`📊 7691 errors in last 24h: ${count[0]?.count || 0}\n`);

  const recent = await db.execute(sql`
    SELECT created_at, context, message, error_code
    FROM system_events 
    WHERE error_code = '7691' 
    ORDER BY created_at DESC 
    LIMIT 10
  `);

  if (recent.length > 0) {
    console.log('📋 Recent 7691 errors:');
    recent.forEach((e: any) => {
      console.log(`\n  Time: ${e.created_at}`);
      console.log(`  Message: ${e.message}`);
      console.log(`  Context: ${e.context}`);
    });
  } else {
    console.log('✅ No 7691 errors found in system_events');
  }

  await client.end();
}

check7691Errors().catch(console.error);
