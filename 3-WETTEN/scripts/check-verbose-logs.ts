import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function checkVerboseLogs() {
  const result = await client`
    SELECT * FROM system_events 
    WHERE source IN ('SmartRouter', 'getDb') 
       OR message LIKE '%[getDb]%' 
       OR message LIKE '%[SmartRouter]%' 
    ORDER BY created_at DESC 
    LIMIT 20
  `;

  console.log('=== VERBOSE LOG CHECK ===');
  console.log('Total records found:', result.length);
  if (result.length > 0) {
    console.log('\n--- Recent verbose logs ---');
    result.forEach((row: any, i: number) => {
      console.log(`${i+1}. [${row.source}] ${row.message.substring(0, 150)}...`);
      console.log(`   @ ${row.created_at}`);
      console.log('');
    });
  } else {
    console.log('❌ NO VERBOSE LOGS FOUND IN DATABASE');
    console.log('This means the handshake is failing BEFORE it can talk to the DB.');
  }

  await client.end();
}

checkVerboseLogs().catch(console.error);
