import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function testRawConnection() {
  console.log('🚀 Testing raw database connection...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  console.log('Original URL:', connectionString.substring(0, 20) + '...');

  // Apply the same transformation as in database/src/index.ts
  if (connectionString.includes('pooler.supabase.com')) {
    console.log('🔄 Transforming pooler URL to direct host...');
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  console.log('Target URL:', connectionString.substring(0, 20) + '...');

  const sql = postgres(connectionString, { 
    prepare: false, 
    connect_timeout: 10,
    ssl: 'require'
  });

  try {
    const result = await sql`SELECT count(*) FROM actors`;
    console.log('✅ Raw connection successful!');
    console.log('Total actors in database:', result[0].count);
  } catch (error: any) {
    console.error('❌ Raw connection failed!');
    console.error('Error message:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

testRawConnection();
