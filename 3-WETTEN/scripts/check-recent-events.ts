import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function checkRecentEvents() {
  console.log('🔍 Checking recent system events...\n');
  
  let connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing');
    process.exit(1);
  }

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
    const events = await sql`
      SELECT * FROM system_events 
      ORDER BY created_at DESC 
      LIMIT 20
    `;

    if (events.length === 0) {
      console.log('✅ No system events found.');
      await sql.end();
      return;
    }

    console.log(`Found ${events.length} recent events:\n`);
    
    events.forEach((e: any, idx: number) => {
      const timestamp = new Date(e.created_at).toISOString();
      console.log(`${idx + 1}. [${timestamp}] ${e.event_type} - ${e.severity}`);
      console.log(`   Context: ${e.context || 'N/A'}`);
      console.log(`   Message: ${e.message}`);
      if (e.details) {
        console.log(`   Details: ${JSON.stringify(e.details, null, 2)}`);
      }
      console.log('');
    });

    await sql.end();
  } catch (err) {
    console.error('❌ Error:', err);
    await sql.end();
    process.exit(1);
  }
}

checkRecentEvents()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
