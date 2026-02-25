import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } });

async function check() {
  try {
    const actors = await sql`SELECT status, count(*) FROM actors GROUP BY status`;
    console.log('Actor statuses:', actors);
    
    const sample = await sql`SELECT id, first_name, status FROM actors LIMIT 5`;
    console.log('Sample actors:', sample);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

check();
