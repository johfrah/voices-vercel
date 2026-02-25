import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function findUnhealthyOrders() {
  console.log('🚀 Deep Scanning for "unhealthy" orders in the 1 Truth database...');
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
    // 1. Check voor lege bedragen (de Smoking Gun!)
    // We casten naar text om de syntax error te vermijden en de lege strings te vinden
    const invalidTotals = await sql`
      SELECT id, wp_order_id, total::text 
      FROM orders 
      WHERE total::text = '' OR total IS NULL
    `;
    console.log(`\n❌ Ongeldige bedragen (lege strings) gevonden: ${invalidTotals.length}`);
    if (invalidTotals.length > 0) {
      console.log('Eerste 5 probleemgevallen:', JSON.stringify(invalidTotals.slice(0, 5), null, 2));
    }

    // 2. Check voor corrupte user_id's (bijv. 0 of negatief)
    const invalidUserIds = await sql`
      SELECT id, wp_order_id, user_id 
      FROM orders 
      WHERE user_id = 0
    `;
    console.log(`\n❌ Ongeldige user_id's (0) gevonden: ${invalidUserIds.length}`);
    if (invalidUserIds.length > 0) {
      console.log('Eerste 5 probleemgevallen:', JSON.stringify(invalidUserIds.slice(0, 5), null, 2));
    }

    // 3. Check voor ontbrekende journeys
    const missingJourney = await sql`
      SELECT id, wp_order_id 
      FROM orders 
      WHERE journey IS NULL OR journey = ''
    `;
    console.log(`\n❌ Ontbrekende journeys gevonden: ${missingJourney.length}`);

    // 4. Check voor orders zonder enige meta-data
    const noMeta = await sql`
      SELECT id, wp_order_id 
      FROM orders 
      WHERE raw_meta IS NULL OR raw_meta::text = '{}'
    `;
    console.log(`\n❌ Orders zonder meta-data: ${noMeta.length}`);

  } catch (error: any) {
    console.error('❌ Deep Scan failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

findUnhealthyOrders();
