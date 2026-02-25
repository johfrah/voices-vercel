import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function deepScanErrors() {
  console.log('🚀 [DEEP SCAN] Searching for hidden data integrity issues in orders...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'db.vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    // 1. Check op corrupte JSON in raw_meta
    console.log('\n🔍 Checking for invalid JSON in raw_meta...');
    const invalidJson = await sql`
      SELECT id, wp_order_id 
      FROM orders 
      WHERE raw_meta IS NOT NULL 
      AND (raw_meta::text = '' OR raw_meta::text = 'null')
      LIMIT 5
    `;
    
    // 2. Check op negatieve of extreme totalen
    console.log('🔍 Checking for extreme or negative totals...');
    const extremeTotals = await sql`
      SELECT id, wp_order_id, total 
      FROM orders 
      WHERE total::numeric < 0 OR total::numeric > 100000
      LIMIT 5
    `;

    // 3. Check op dubbele WooCommerce IDs (import slop)
    console.log('🔍 Checking for duplicate WooCommerce IDs...');
    const duplicates = await sql`
      SELECT wp_order_id, COUNT(*) 
      FROM orders 
      WHERE wp_order_id IS NOT NULL 
      GROUP BY wp_order_id 
      HAVING COUNT(*) > 1 
      LIMIT 5
    `;

    // 4. Check op ontbrekende status
    console.log('🔍 Checking for missing status...');
    const missingStatus = await sql`
      SELECT id, wp_order_id 
      FROM orders 
      WHERE status IS NULL OR status = ''
      LIMIT 5
    `;

    console.log('\n🚨 GEVONDEN HIDDEN ERRORS:');
    
    if (invalidJson.length > 0) {
      console.log('\n📄 Corrupte Metadata (Breekt Guest-parsing):');
      console.table(invalidJson);
    }

    if (extremeTotals.length > 0) {
      console.log('\n💰 Extreme Bedragen (Mogelijke import fouten):');
      console.table(extremeTotals);
    }

    if (duplicates.length > 0) {
      console.log('\n👯 Dubbele Import IDs (Data vervuiling):');
      console.table(duplicates);
    }

    if (missingStatus.length > 0) {
      console.log('\n🏷️ Ontbrekende Status (Breekt filters):');
      console.table(missingStatus);
    }

    if ([invalidJson, extremeTotals, duplicates, missingStatus].every(a => a.length === 0)) {
      console.log('✅ Geen verdere structurele fouten gevonden in deze categorieën.');
    }

  } catch (error: any) {
    console.error('❌ Scan failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

deepScanErrors();
