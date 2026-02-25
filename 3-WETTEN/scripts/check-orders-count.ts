import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function checkOrdersCount() {
  console.log('🔍 Checking orders count...\n');
  
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
    // Total count
    const totalCount = await sql`
      SELECT COUNT(*) as count FROM orders
    `;
    console.log(`📊 Total orders in database: ${totalCount[0].count}`);

    // Count with users
    const withUsers = await sql`
      SELECT COUNT(*) as count 
      FROM orders o
      INNER JOIN users u ON o.user_id = u.id
    `;
    console.log(`👤 Orders with valid users: ${withUsers[0].count}`);

    // Count without users
    const withoutUsers = await sql`
      SELECT COUNT(*) as count 
      FROM orders o
      WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM users)
    `;
    console.log(`⚠️  Orders without users: ${withoutUsers[0].count}`);

    // Sample of first 5 orders
    const sample = await sql`
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
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    console.log('\n📦 Sample of 5 most recent orders:');
    sample.forEach((order: any, idx: number) => {
      console.log(`\n${idx + 1}. Order ID: ${order.id}`);
      console.log(`   WP Order ID: ${order.wp_order_id}`);
      console.log(`   Display ID: ${order.display_order_id || 'N/A'}`);
      console.log(`   Total: €${order.total}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Journey: ${order.journey}`);
      console.log(`   User: ${order.first_name || 'N/A'} ${order.last_name || ''} (${order.email || 'N/A'})`);
      console.log(`   Created: ${order.created_at}`);
    });

    await sql.end();
  } catch (err) {
    console.error('❌ Error:', err);
    await sql.end();
    process.exit(1);
  }
}

checkOrdersCount()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
