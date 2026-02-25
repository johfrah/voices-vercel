import { db } from './1-SITE/apps/web/src/lib/db';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

async function main() {
  try {
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log('Tables:', result.map((r: any) => r.table_name));
  } catch (e) {
    console.error('Error listing tables:', e);
  }
}

main();
