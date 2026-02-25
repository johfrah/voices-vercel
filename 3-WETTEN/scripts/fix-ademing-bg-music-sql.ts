
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connectionString.replace('pgbouncer=true', 'sslmode=require'), { ssl: { rejectUnauthorized: false } });

async function runFix() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING BG MUSIC SCHEMA FIX ---');
  
  try {
    console.log('Adding unique constraint to ademing_background_music...');
    await sql`ALTER TABLE ademing_background_music ADD CONSTRAINT ademing_background_music_title_unique UNIQUE (title);`;
    console.log('SUCCESS: Unique constraint added.');
  } catch (err) {
    console.error('FAILED (maybe already exists?):', err.message);
  } finally {
    await sql.end();
  }
}

runFix();
