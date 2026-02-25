
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.vcbxyyjsxuquytcsskpj:VoicesHeadless20267654323456@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const sql = postgres(connectionString.replace('pgbouncer=true', 'sslmode=require'), { ssl: { rejectUnauthorized: false } });

async function checkTable() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: TABLE STRUCTURE AUDIT ---');
  
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ademing_tracks';
    `;
    console.table(columns);
    
    const count = await sql`SELECT count(*) FROM ademing_tracks;`;
    console.log('Total tracks:', count[0].count);
    
    const sample = await sql`SELECT * FROM ademing_tracks LIMIT 1;`;
    console.log('Sample track:', sample[0]);
  } catch (err) {
    console.error('FAILED:', err);
  } finally {
    await sql.end();
  }
}

checkTable();
