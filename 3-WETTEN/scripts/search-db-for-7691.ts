import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function searchDbFor7691() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Searching database for 7691...\n');

  // Search app_configs
  const configs = await db.execute(sql`
    SELECT key, value::text
    FROM app_configs
    WHERE value::text LIKE '%7691%'
  `);
  console.log(`📊 Found in app_configs: ${configs.length}`);
  configs.forEach((c: any) => console.log(`  Key: ${c.key}`));

  // Search market_configs
  const markets = await db.execute(sql`
    SELECT market, name
    FROM market_configs
    WHERE name LIKE '%7691%' OR email LIKE '%7691%' OR phone LIKE '%7691%'
  `);
  console.log(`📊 Found in market_configs: ${markets.length}`);
  markets.forEach((m: any) => console.log(`  Market: ${m.market}`));

  // Search translation_registry
  const translations = await db.execute(sql`
    SELECT string_hash, original_text
    FROM translation_registry
    WHERE original_text LIKE '%7691%'
  `);
  console.log(`📊 Found in translation_registry: ${translations.length}`);

  await client.end();
}

searchDbFor7691().catch(console.error);
