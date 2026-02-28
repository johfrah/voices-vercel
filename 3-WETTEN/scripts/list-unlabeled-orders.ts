import postgres from 'postgres';

async function listUnlabeledOrders() {
  console.log('🕵️ [CHRIS-PROTOCOL] Unlabeled Orders Scan (Top 20 by Revenue)\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });

  try {
    const results = await sql`
      SELECT 
        id, 
        total, 
        COALESCE(raw_meta->>'_billing_company', '') as company,
        COALESCE(raw_meta->>'_billing_first_name', '') || ' ' || COALESCE(raw_meta->>'_billing_last_name', '') as customer,
        created_at
      FROM orders 
      WHERE world_id IS NULL
      ORDER BY total::numeric DESC 
      LIMIT 20
    `;

    console.table(results.map(r => ({
      ID: r.id,
      Bedrag: `€${parseFloat(r.total).toFixed(2)}`,
      Bedrijf: r.company,
      Klant: r.customer,
      Datum: new Date(r.created_at).toLocaleDateString('nl-BE')
    })));

    console.log('\n💡 Gebruik het commando: npx tsx 3-WETTEN/scripts/assign-world.ts [ORDER_ID] [WORLD_CODE]');
    console.log('Codes: agency, studio, academy, artist, portfolio, ademing, freelance');

  } catch (error) {
    console.error('❌ Scan Failed:', error);
  }
  process.exit(0);
}

listUnlabeledOrders();
