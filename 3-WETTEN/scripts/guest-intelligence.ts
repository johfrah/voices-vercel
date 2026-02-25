import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function findLinkableGuests() {
  console.log('🚀 [GUEST INTELLIGENCE] Searching for guest orders that can be linked to users...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    // 1. Haal guest orders op (user_id IS NULL)
    const guestOrders = await sql`
      SELECT id, wp_order_id, raw_meta, created_at 
      FROM orders 
      WHERE user_id IS NULL 
      AND raw_meta IS NOT NULL
      ORDER BY created_at DESC 
    `;

    console.log(`📊 Found ${guestOrders.length} recent guest orders to analyze.`);

    const linkable = [];
    const trulyNew = [];

    for (const order of guestOrders) {
      try {
        const meta = typeof order.raw_meta === 'string' ? JSON.parse(order.raw_meta) : order.raw_meta;
        const email = meta?.billing?.email;

        if (email) {
          // Check of deze email al in onze users tabel staat
          const [existingUser] = await sql`SELECT id, email FROM users WHERE email = ${email} LIMIT 1`;
          
          if (existingUser) {
            linkable.push({
              orderId: order.id,
              wpOrderId: order.wp_order_id,
              email: email,
              potentialUserId: existingUser.id,
              name: `${meta.billing.first_name} ${meta.billing.last_name}`
            });
          } else {
            trulyNew.push({
              orderId: order.id,
              email: email,
              name: `${meta.billing.first_name} ${meta.billing.last_name}`
            });
          }
        }
      } catch (e) {
        // Skip corrupt meta
      }
    }

    console.log('\n✅ KOPPELBARE GUEST ORDERS (User bestaat al):');
    if (linkable.length > 0) {
      console.table(linkable.slice(0, 10));
      console.log(`... en nog ${Math.max(0, linkable.length - 10)} anderen.`);
    } else {
      console.log('Geen directe matches gevonden met bestaande users.');
    }

    console.log('\n🆕 NIEUWE GUESTS (Nog geen user account):');
    if (trulyNew.length > 0) {
      console.table(trulyNew.slice(0, 5));
    }

  } catch (error: any) {
    console.error('❌ Intelligence scan failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

findLinkableGuests();
