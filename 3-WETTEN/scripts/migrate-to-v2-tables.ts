import { db } from '../../1-SITE/packages/database/src/index';
import { orders, ordersV2, ordersLegacyBloat } from '../../1-SITE/packages/database/src/schema';
import { eq, and, sql } from 'drizzle-orm';

async function migrateToV2Tables() {
  console.log('🚀 Starting Migration to Clean V2 Tables (December 2025)...');

  try {
    // 1. Fetch December 2025 Orders from the "Hybrid" table
    const decemberOrders = await db.select().from(orders).where(
      and(
        sql`created_at >= '2025-12-01'`,
        sql`created_at <= '2025-12-31'`
      )
    );

    console.log(`📊 Found ${decemberOrders.length} orders to migrate.`);

    for (const order of decemberOrders) {
      console.log(`🕵️ Migrating Order ${order.id} (WP: ${order.wpOrderId})...`);

      // A. Insert into Legacy Bloat (The Rugzak)
      const [bloat] = await db.insert(ordersLegacyBloat).values({
        wpOrderId: order.wpOrderId,
        rawMeta: order.rawMeta
      }).onConflictDoUpdate({
        target: ordersLegacyBloat.wpOrderId,
        set: { rawMeta: order.rawMeta }
      }).returning();

      // B. Insert into Orders V2 (Clean)
      await db.insert(ordersV2).values({
        wpOrderId: order.wpOrderId,
        userId: order.user_id,
        journeyId: order.journeyId,
        statusId: order.statusId,
        paymentMethodId: order.paymentMethodId,
        amountNet: order.amountNet,
        amountTotal: order.total,
        purchaseOrder: order.purchaseOrder,
        billingEmailAlt: order.billingEmailAlt,
        createdAt: order.createdAt,
        legacyBloatId: bloat.id
      }).onConflictDoUpdate({
        target: ordersV2.wpOrderId,
        set: {
          journeyId: order.journeyId,
          statusId: order.statusId,
          paymentMethodId: order.paymentMethodId,
          amountNet: order.amountNet,
          amountTotal: order.total,
          purchaseOrder: order.purchaseOrder,
          billingEmailAlt: order.billingEmailAlt,
          legacyBloatId: bloat.id
        }
      });
    }

    console.log('✅ Migration to Clean V2 Tables Completed.');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  }
  process.exit(0);
}

migrateToV2Tables();
