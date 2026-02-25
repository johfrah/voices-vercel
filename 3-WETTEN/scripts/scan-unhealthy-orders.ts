import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function findUnhealthyOrders() {
  console.log('🚀 Scanning for "unhealthy" orders in the 1 Truth database...');
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
    // 1. Check voor ongeldige datums (vóór 2000 of in de verre toekomst)
    const invalidDates = await sql`
      SELECT id, wp_order_id, created_at 
      FROM orders 
      WHERE created_at < '2000-01-01' OR created_at > '2030-01-01'
    `;
    console.log(`\n❌ Ongeldige datums gevonden: ${invalidDates.length}`);
    if (invalidDates.length > 0) console.log(JSON.stringify(invalidDates, null, 2));

    // 2. Check voor corrupte/lege bedragen
    const invalidTotals = await sql`
      SELECT id, wp_order_id, total 
      FROM orders 
      WHERE total IS NULL OR total = '' OR total = 'NaN'
    `;
    console.log(`\n❌ Ongeldige bedragen (total) gevonden: ${invalidTotals.length}`);
    if (invalidTotals.length > 0) console.log(JSON.stringify(invalidTotals, null, 2));

    // 3. Check voor ontbrekende journeys (kritiek voor routering)
    const missingJourney = await sql`
      SELECT id, wp_order_id 
      FROM orders 
      WHERE journey IS NULL OR journey = ''
    `;
    console.log(`\n❌ Ontbrekende journeys gevonden: ${missingJourney.length}`);
    if (missingJourney.length > 0) console.log(JSON.stringify(missingJourney, null, 2));

    // 4. Check voor corrupte raw_meta (JSONB integriteit)
    const corruptMeta = await sql`
      SELECT id, wp_order_id 
      FROM orders 
      WHERE raw_meta IS NULL
    `;
    console.log(`\n❌ Ontbrekende raw_meta (WooCommerce data) gevonden: ${corruptMeta.length}`);
    if (corruptMeta.length > 0) console.log(JSON.stringify(corruptMeta, null, 2));

    // 5. Check voor orphan users (user_id ingevuld maar user bestaat niet)
    const orphanOrders = await sql`
      SELECT o.id, o.user_id 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.user_id IS NOT NULL AND u.id IS NULL
    `;
    console.log(`\n❌ Orphan orders (verwijzen naar niet-bestaande user) gevonden: ${orphanOrders.length}`);
    if (orphanOrders.length > 0) console.log(JSON.stringify(orphanOrders, null, 2));

  } catch (error: any) {
    console.error('❌ Scan failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

findUnhealthyOrders();
