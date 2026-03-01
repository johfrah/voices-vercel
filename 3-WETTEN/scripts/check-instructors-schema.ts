import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

async function checkSchema() {
  const client = postgres(process.env.DATABASE_URL!, { 
    max: 1,
    ssl: { rejectUnauthorized: false }
  });
  const db = drizzle(client);

  console.log('🔍 Checking instructors table schema...\n');

  const columns = await db.execute(sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'instructors'
  `);

  console.log('📊 Columns in instructors:');
  columns.forEach((c: any) => {
    console.log(`- ${c.column_name} (${c.data_type})`);
  });

  await client.end();
}

checkSchema().catch(console.error);
