import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function debugZeroOrders() {
  console.log('🚀 [DEBUG] Investigating why API returns 0 orders...');
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
    // 1. Check de ruwe query zonder joins
    const rawCount = await sql`SELECT count(*) FROM orders`;
    console.log(`📊 Total orders in DB: ${rawCount[0].count}`);

    // 2. Check de query MET de join (zoals in de API)
    const joinCount = await sql`
      SELECT count(*) 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    console.log(`📊 Orders after LEFT JOIN with users: ${joinCount[0].count}`);

    // 3. Inspecteer de eerste 5 orders ruw
    const sample = await sql`SELECT id, user_id, journey, market, created_at FROM orders ORDER BY created_at DESC LIMIT 5`;
    console.log('📦 Sample Orders (Raw):', JSON.stringify(sample, null, 2));

    // 4. Check of er iets geks is met de user_id koppeling
    const nullUsers = await sql`SELECT count(*) FROM orders WHERE user_id IS NULL`;
    console.log(`📊 Orders with NULL user_id: ${nullUsers[0].count}`);

  } catch (error: any) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

debugZeroOrders();
