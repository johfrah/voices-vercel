import postgres from 'postgres';

async function syncV2Content() {
  console.log('🚀 [CHRIS-PROTOCOL] Synchronizing Content for 48 V2 Orders...\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });

  try {
    // 1. Get all V2 orders
    const v2Orders = await sql`SELECT id FROM orders_v2`;
    console.log(`📊 Found ${v2Orders.length} orders in orders_v2 to enrich.`);

    for (const v2 of v2Orders) {
      const wpOrderId = v2.id; // In orders_v2, the ID is the WP Order ID
      
      // 2. Find the corresponding internal order ID from the 'orders' table
      const [legacyOrder] = await sql`SELECT id FROM orders WHERE wp_order_id = ${wpOrderId}`;
      
      if (!legacyOrder) {
        console.warn(`⚠️  No legacy order found for WP ID ${wpOrderId}. Skipping.`);
        continue;
      }

      const internalId = legacyOrder.id;

      // 3. Enrich the order_items with the WP Order ID
      // This creates the bridge between the items and the V2 order
      const updatedItems = await sql`
        UPDATE order_items 
        SET wp_order_id = ${wpOrderId} 
        WHERE order_id = ${internalId}
      `;

      console.log(`✅ Order ${wpOrderId}: Enriched ${updatedItems.count} items with WP ID.`);
    }

    console.log('\n🏁 Content Synchronization Completed.');

  } catch (error) {
    console.error('❌ Sync Failed:', error);
  }
  process.exit(0);
}

syncV2Content();
