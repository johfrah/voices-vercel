import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function find7691Errors() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Searching for 7691 errors...\n');

  const events = await db.execute(sql`
    SELECT created_at, source, level, message, details
    FROM system_events
    WHERE message LIKE '%7691%' OR details::text LIKE '%7691%'
    ORDER BY created_at DESC
    LIMIT 20
  `);

  console.log(`📊 Found ${events.length} matching events`);
  
  events.forEach((e: any) => {
    console.log(`[${e.level.toUpperCase()}] ${e.source} (${e.created_at})`);
    console.log(`  Message: ${e.message}`);
    if (e.details) {
      console.log(`  Details: ${JSON.stringify(e.details, null, 2)}`);
    }
    console.log('---');
  });

  await client.end();
}

find7691Errors().catch(console.error);
