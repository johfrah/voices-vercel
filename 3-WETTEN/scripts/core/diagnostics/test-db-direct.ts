import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

async function test() {
  const url = process.env.DATABASE_URL;
  
  console.log('Testing connection to:', url?.split('@')[1]); // Don't log password
  
  if (!url) {
    console.error('No URL found');
    process.exit(1);
  }

  // Try parsing manually and passing options object to avoid URL encoding issues in the string
  const u = new URL(url);
  const sql = postgres({
    host: u.hostname,
    port: parseInt(u.port),
    database: u.pathname.slice(1),
    username: u.username,
    password: decodeURIComponent(u.password),
    ssl: 'require'
  });

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
