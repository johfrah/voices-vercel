import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function debugOrdersApi() {
  console.log('🚀 Debugging Orders API query...');
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
    console.log('--- Step 1: Check orders table columns ---');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `;
    console.log('Orders columns:', columns.map(c => c.column_name).join(', '));

    console.log('\n--- Step 2: Test the exact query from the API ---');
    // We simuleren de query: select id, wp_order_id, display_order_id, total, status, journey, created_at, is_quote
    // En de join met users op user_id
    try {
      const result = await sql`
        SELECT 
          o.id, 
          o.wp_order_id, 
          o.display_order_id, 
          o.total, 
          o.status, 
          o.journey, 
          o.created_at, 
          o.is_quote,
          u.first_name,
          u.last_name,
          u.email,
          u.company_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `;
      console.log('✅ Query successful! Sample data:', JSON.stringify(result[0], null, 2));
    } catch (e: any) {
      console.error('❌ Query failed:', e.message);
      
      if (e.message.includes('column "is_quote" does not exist')) {
        console.log('🔍 Potential issue found: is_quote column might be missing or named differently.');
      }
    }

    console.log('\n--- Step 3: Check for potential NULL issues in required fields ---');
    const nullJourney = await sql`SELECT count(*) FROM orders WHERE journey IS NULL`;
    console.log('Orders with NULL journey:', nullJourney[0].count);

  } catch (error: any) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

debugOrdersApi();
