import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function forensicLogCheck() {
  const errors = await client`
    SELECT id, source, message, details, created_at 
    FROM system_events 
    WHERE level IN ('error', 'critical')
    ORDER BY created_at DESC 
    LIMIT 10
  `;

  console.log('=== 🕵️ FORENSIC ERROR ANALYSIS ===');
  errors.forEach((row: any, i: number) => {
    console.log(`\n${i+1}. [${row.source}] ${row.message}`);
    console.log(`   @ ${row.created_at}`);
    console.log(`   URL: ${row.details?.url || 'N/A'}`);
    console.log(`   Referer: ${row.details?.referer || 'N/A'}`);
    console.log(`   Details:`, JSON.stringify(row.details, null, 2));
  });

  await client.end();
}

forensicLogCheck().catch(console.error);
