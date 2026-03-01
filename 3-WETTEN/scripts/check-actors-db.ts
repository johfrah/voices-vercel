import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function checkActors() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Checking actors in DB...\n');

  const actors = await db.execute(sql`
    SELECT id, first_name, native_language_id, status_id, is_public, wp_product_id
    FROM actors
    WHERE status_id = (SELECT id FROM actor_statuses WHERE code = 'live' LIMIT 1)
    AND is_public = true
    LIMIT 20
  `);

  console.log(`📊 Found ${actors.length} live public actors`);
  actors.forEach((a: any) => {
    console.log(`- ${a.first_name} (ID: ${a.id}, NativeLangID: ${a.native_language_id}, StatusID: ${a.status_id}, Public: ${a.is_public})`);
  });

  const languages = await db.execute(sql`SELECT id, code, label FROM languages`);
  console.log('\n🌐 Languages:');
  languages.forEach((l: any) => {
    console.log(`- ${l.label} (ID: ${l.id}, Code: ${l.code})`);
  });

  await client.end();
}

checkActors().catch(console.error);
