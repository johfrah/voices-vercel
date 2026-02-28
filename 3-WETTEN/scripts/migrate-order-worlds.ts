import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../1-SITE/packages/database/src/schema/index';
import { worlds, journeys, orders, ordersV2 } from '../../1-SITE/packages/database/src/schema/index';
import { eq, isNotNull } from 'drizzle-orm';

async function migrateOrderWorlds() {
  console.log('🚀 Migrating World IDs for Orders...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });
  const db = drizzle(client, { schema });

  try {
    const allJourneys = await db.select().from(journeys).where(isNotNull(journeys.worldId));
    console.log(`📊 Found ${allJourneys.length} journeys with World IDs.`);

    for (const j of allJourneys) {
      console.log(`🕵️ Migrating orders for Journey: ${j.code} -> World ID: ${j.worldId}...`);
      
      // Update orders table
      const updatedOrders = await db.update(orders)
        .set({ worldId: j.worldId })
        .where(eq(orders.journeyId, j.id));
      
      // Update orders_v2 table
      const updatedOrdersV2 = await db.update(ordersV2)
        .set({ worldId: j.worldId })
        .where(eq(ordersV2.journeyId, j.id));

      console.log(`✅ Updated orders for ${j.code}.`);
    }

    console.log('🏁 Order World Migration Completed.');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
  process.exit(0);
}

migrateOrderWorlds();
