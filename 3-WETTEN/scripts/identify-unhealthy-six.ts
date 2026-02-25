import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function identifySpecificSix() {
  console.log('🚀 Identifying the 6 unhealthy orders...');
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
    // We zoeken specifiek naar de orders zonder raw_meta of met lege bedragen
    const unhealthyOrders = await sql`
      SELECT 
        id, 
        wp_order_id, 
        total, 
        journey, 
        created_at,
        CASE 
          WHEN raw_meta IS NULL OR raw_meta::text = '{}' THEN 'Missing Meta'
          WHEN total::text = '' THEN 'Empty Total'
          ELSE 'Unknown Issue'
        END as issue_reason
      FROM orders 
      WHERE raw_meta IS NULL OR raw_meta::text = '{}' OR total::text = ''
      ORDER BY created_at DESC
    `;

    console.log('\n--- THE UNHEALTHY SIX ---');
    console.table(unhealthyOrders);

  } catch (error: any) {
    console.error('❌ Identification failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

identifySpecificSix();
