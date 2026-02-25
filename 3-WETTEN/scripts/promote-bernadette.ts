import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function promote() {
  console.log('🚀 Promoting Bernadette to ADMIN...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing');
    process.exit(1);
  }

  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
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
    const result = await sql`UPDATE users SET role = 'admin' WHERE email = 'bernadette@voices.be' RETURNING id, email, role`;
    console.log('✅ Update successful:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Update failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

promote();
