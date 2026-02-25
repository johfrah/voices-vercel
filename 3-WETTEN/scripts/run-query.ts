import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Zoek de .env.local file relatief aan het script zelf
const envPath = path.resolve(__dirname, '../../1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

async function runQuery() {
  const query = process.argv[2];
  if (!query) {
    console.error('Usage: npx tsx run-query.ts "SELECT ..."');
    process.exit(1);
  }

  let connectionString = process.env.DATABASE_URL!;
  // Lex-Mandate: Bypass transformation for pooler check
  /*
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }
  */

  const sql = postgres(connectionString, { 
    ssl: 'require',
    onnotice: () => {} 
  });

  try {
    console.log(`Executing: ${query}`);
    const result = await sql.unsafe(query);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

runQuery();
