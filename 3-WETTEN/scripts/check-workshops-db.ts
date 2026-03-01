import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function checkWorkshops() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Checking workshops in DB...\n');

  const workshops = await db.execute(sql`
    SELECT id, title, slug, status, is_public
    FROM workshops
    ORDER BY id DESC
  `);

  console.log(`📊 Found ${workshops.length} workshops`);
  workshops.forEach((w: any) => {
    console.log(`[${w.status}] ${w.title} (ID: ${w.id}, Public: ${w.is_public})`);
  });

  const editions = await db.execute(sql`
    SELECT id, workshop_id, date, status
    FROM workshop_editions
    WHERE date >= NOW()
  `);

  console.log(`\n📊 Found ${editions.length} upcoming editions`);
  editions.forEach((e: any) => {
    console.log(`Edition ${e.id} for Workshop ${e.workshop_id} on ${e.date} (Status: ${e.status})`);
  });

  await client.end();
}

checkWorkshops().catch(console.error);
