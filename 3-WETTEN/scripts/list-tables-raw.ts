import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function listTables() {
  let connectionString = process.env.DATABASE_URL!;
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'db.vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { 
    prepare: false, 
    connect_timeout: 10,
    ssl: 'require'
  });

  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables:', result.map((r: any) => r.table_name).sort());
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

listTables();
