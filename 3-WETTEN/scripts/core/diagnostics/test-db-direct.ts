import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'apps/web/.env.local') });

async function test() {
  const url = process.env.DATABASE_URL?.replace(':6543', ':5432').replace('?pgbouncer=true', '');
  
  console.log('Testing direct connection to:', url);
  
  if (!url) {
    console.error('No URL found');
    process.exit(1);
  }

  const sql = postgres(url);

  try {
    const result = await sql`SELECT 1 as result`;
    console.log('Connection successful:', result);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await sql.end();
  }
  process.exit(0);
}

test();
