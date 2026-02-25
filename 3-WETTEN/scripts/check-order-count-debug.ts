import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function checkOrderCount() {
  console.log('🚀 Checking total order count in database...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  // Apply transformation for Supabase
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
    const result = await sql`SELECT count(*) FROM orders`;
    console.log('✅ Query successful!');
    console.log('TOTAL_ORDERS_IN_DB:', result[0].count);
    
    const wpOrders = await sql`SELECT count(*) FROM orders WHERE wp_order_id IS NOT NULL`;
    console.log('TOTAL_WOOCOMMERCE_ORDERS:', wpOrders[0].count);

    const firstFive = await sql`SELECT id, wp_order_id, created_at FROM orders ORDER BY created_at DESC LIMIT 5`;
    console.log('LATEST_ORDERS:', JSON.stringify(firstFive, null, 2));

  } catch (error: any) {
    console.error('❌ Query failed!');
    console.error('Error message:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

checkOrderCount();
