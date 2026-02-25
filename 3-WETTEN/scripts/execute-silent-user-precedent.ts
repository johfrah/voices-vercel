import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

async function executeSilentUserPrecedent() {
  console.log('🚀 [PRECEDENT] Starting Silent User Creation & Order Linking...');
  let connectionString = process.env.DATABASE_URL!;
  
  if (connectionString.includes('pooler.supabase.com')) {
    connectionString = connectionString.replace('aws-1-eu-west-1.pooler.supabase.com', 'db.vcbxyyjsxuquytcsskpj.supabase.co');
    connectionString = connectionString.replace(':6543', ':5432');
    connectionString = connectionString.replace('postgres.vcbxyyjsxuquytcsskpj', 'postgres');
    connectionString = connectionString.split('?')[0]; 
  }

  const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

  try {
    const guests = await sql`
      SELECT id, wp_order_id, raw_meta 
      FROM orders 
      WHERE user_id IS NULL 
      AND raw_meta IS NOT NULL
    `;

    console.log(`📊 Found ${guests.length} guest orders to process.`);

    let linkedToExisting = 0;
    let shadowUsersCreated = 0;
    let skipped = 0;

    for (const g of guests) {
      const metaStr = typeof g.raw_meta === 'string' ? g.raw_meta : JSON.stringify(g.raw_meta);
      const emailMatch = metaStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      
      if (!emailMatch) {
        skipped++;
        continue;
      }

      const email = emailMatch[0].toLowerCase();
      
      // 1. Check of user al bestaat
      let [user] = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

      if (!user) {
        // 2. Maak Shadow User (Silent)
        // We proberen ook een naam te vinden in de meta
        let firstName = 'Guest';
        let lastName = '';
        try {
          const meta = typeof g.raw_meta === 'string' ? JSON.parse(g.raw_meta) : g.raw_meta;
          firstName = meta?.billing?.first_name || meta?._billing_first_name || 'Guest';
          lastName = meta?.billing?.last_name || meta?._billing_last_name || '';
        } catch (e) {}

        [user] = await sql`
          INSERT INTO users (email, first_name, last_name, role, created_at)
          VALUES (${email}, ${firstName}, ${lastName}, 'customer', NOW())
          RETURNING id
        `;
        shadowUsersCreated++;
      } else {
        linkedToExisting++;
      }

      // 3. Koppel order aan user
      await sql`UPDATE orders SET user_id = ${user.id} WHERE id = ${g.id}`;
    }

    console.log('\n✅ PRECEDENT VOLTOOID:');
    console.log(`🔗 Gekoppeld aan bestaande users: ${linkedToExisting}`);
    console.log(`👤 Shadow users aangemaakt: ${shadowUsersCreated}`);
    console.log(`⏩ Overgeslagen (geen email): ${skipped}`);

  } catch (error: any) {
    console.error('❌ Precedent failed:', error.message);
  } finally {
    await sql.end();
    process.exit();
  }
}

executeSilentUserPrecedent();
