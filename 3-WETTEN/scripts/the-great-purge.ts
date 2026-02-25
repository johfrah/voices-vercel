import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function purgeUnhealthySix() {
  console.log('☢️ PURGE MODE: Removing the 6 unhealthy test/donation orders...');
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
    // De specifieke ID's die we hebben geïdentificeerd
    const idsToPurge = [27323, 27322, 27321, 27320, 27318, 27317];
    
    console.log(`Target IDs: ${idsToPurge.join(', ')}`);

    // 1. Verwijder eerst eventuele gekoppelde order_items (Foreign Key constraint safety)
    const deletedItems = await sql`
      DELETE FROM order_items 
      WHERE order_id IN ${sql(idsToPurge)}
      RETURNING id
    `;
    console.log(`✅ Deleted ${deletedItems.length} linked order items.`);

    // 2. Verwijder de orders zelf
    const deletedOrders = await sql`
      DELETE FROM orders 
      WHERE id IN ${sql(idsToPurge)}
      RETURNING id, wp_order_id
    `;
    
    console.log(`✅ Successfully purged ${deletedOrders.length} unhealthy orders.`);
    console.log('Purged IDs:', JSON.stringify(deletedOrders, null, 2));

    // 3. Final Count Check
    const finalCount = await sql`SELECT count(*) FROM orders`;
    console.log(`\n📊 NEW TOTAL ORDERS IN DB: ${finalCount[0].count}`);

  } catch (error: any) {
    console.error('❌ Purge failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

purgeUnhealthySix();
