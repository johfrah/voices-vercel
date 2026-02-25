import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function findCorruptExamples() {
  console.log('🚀 Searching for corrupted data examples in orders...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    // 1. Zoek naar orders met lege of vreemde totalen
    const emptyTotals = await sql`SELECT id, wp_order_id, total, created_at FROM orders WHERE total::text = '' OR total IS NULL LIMIT 3`;
    
    // 2. Zoek naar orders zonder journey of market
    const missingContext = await sql`SELECT id, wp_order_id, journey, market, created_at FROM orders WHERE journey IS NULL OR market IS NULL LIMIT 3`;

    // 3. Zoek naar orders met mogelijk corrupte datums (bijv. ver in de toekomst of verleden)
    const weirdDates = await sql`SELECT id, wp_order_id, created_at FROM orders WHERE created_at < '2000-01-01' OR created_at > '2030-01-01' LIMIT 3`;

    // 4. Zoek naar orders zonder user_id (wees-orders)
    const orphans = await sql`SELECT id, wp_order_id, created_at FROM orders WHERE user_id IS NULL LIMIT 3`;

    console.log('\n❌ VOORBEELDEN VAN DATA-FOUTEN:');
    
    if (emptyTotals.length > 0) {
      console.log('\n💰 Lege Totalen (Breekt berekeningen):');
      console.table(emptyTotals);
    }

    if (missingContext.length > 0) {
      console.log('\n🌍 Ontbrekende Context (Breekt filtering):');
      console.table(missingContext);
    }

    if (weirdDates.length > 0) {
      console.log('\n📅 Corrupte Datums (Breekt tijdlijnen):');
      console.table(weirdDates);
    }

    if (orphans.length > 0) {
      console.log('\n👤 Wees-orders (Geen klant gekoppeld):');
      console.table(orphans);
    }

  } catch (error: any) {
    console.error('❌ Fout bij zoeken:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

findCorruptExamples();
