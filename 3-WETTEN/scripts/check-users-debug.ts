import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function checkUsers() {
  console.log('🚀 Checking users table...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is missing in .env.local');
    process.exit(1);
  }

  // Apply transformation for Supabase
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
    const usersCount = await sql`SELECT count(*) FROM users`;
    console.log('TOTAL_USERS:', usersCount[0].count);

    const admins = await sql`SELECT id, email, role FROM users WHERE role = 'admin' OR email IN ('johfrah@voices.be', 'bernadette@voices.be')`;
    console.log('ADMINS_IN_DB:', JSON.stringify(admins, null, 2));

    const ordersWithUsers = await sql`
      SELECT o.id as order_id, o.user_id, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LIMIT 10
    `;
    console.log('ORDERS_WITH_USERS_SAMPLE:', JSON.stringify(ordersWithUsers, null, 2));

    const ordersWithoutUsers = await sql`SELECT count(*) FROM orders WHERE user_id IS NULL`;
    console.log('ORDERS_WITHOUT_USER_ID:', ordersWithoutUsers[0].count);

  } catch (error: any) {
    console.error('❌ Query failed!');
    console.error('Error message:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

checkUsers();
