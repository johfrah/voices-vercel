import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function checkRecentEvents() {
  // Check last 20 events of any kind
  const allEvents = await client`
    SELECT id, source, message, created_at 
    FROM system_events 
    ORDER BY created_at DESC 
    LIMIT 20
  `;

  console.log('=== RECENT SYSTEM EVENTS (ALL SOURCES) ===');
  console.log('Total records found:', allEvents.length);
  if (allEvents.length > 0) {
    console.log('\n--- Last 20 events ---');
    allEvents.forEach((row: any, i: number) => {
      console.log(`${i+1}. [${row.source}] ${row.message.substring(0, 100)}...`);
      console.log(`   @ ${row.created_at}`);
      console.log('');
    });
  } else {
    console.log('❌ NO EVENTS FOUND AT ALL');
  }

  // Check specifically for SmartRouter/getDb
  const verboseEvents = await client`
    SELECT * FROM system_events 
    WHERE source IN ('SmartRouter', 'getDb') 
       OR message LIKE '%[getDb]%' 
       OR message LIKE '%[SmartRouter]%' 
    ORDER BY created_at DESC 
    LIMIT 20
  `;

  console.log('\n=== VERBOSE LOG CHECK (SmartRouter/getDb) ===');
  console.log('Total verbose records found:', verboseEvents.length);
  if (verboseEvents.length === 0) {
    console.log('❌ NO VERBOSE LOGS FOUND');
    console.log('This means the handshake is failing BEFORE it can talk to the DB.');
  }

  await client.end();
}

checkRecentEvents().catch(console.error);
