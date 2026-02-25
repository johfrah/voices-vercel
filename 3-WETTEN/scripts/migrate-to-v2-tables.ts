import { db } from '../../1-SITE/packages/database/src/index';
import { orders, ordersV2, ordersLegacyBloat } from '../../1-SITE/packages/database/src/schema';
import { eq, and, sql } from 'drizzle-orm';

async function migrateToV2Tables() {
  console.log('🚀 Starting Migration to Clean V2 Tables (WP ID as PK + Legacy ID)...');

  try {
    const decemberOrders = await db.select().from(orders).where(
      and(
        sql`created_at >= '2025-12-01'`,
        sql`created_at <= '2025-12-31'`
      )
    );

    console.log(`📊 Found ${decemberOrders.length} orders to migrate.`);

    for (const order of decemberOrders) {
      if (!order.wpOrderId) {
        console.warn(`⚠️ Skipping Order ${order.id} - No WP Order ID found.`);
        continue;
      }

      console.log(`🕵️ Migrating Order ${order.wpOrderId}...`);

      // A. Insert into Legacy Bloat (WP ID as PK)
      await db.insert(ordersLegacyBloat).values({
        wpOrderId: order.wpOrderId,
        rawMeta: order.rawMeta
      }).onConflictDoUpdate({
        target: ordersLegacyBloat.wpOrderId,
        set: { rawMeta: order.rawMeta }
      });

      // B. Insert into Orders V2 (WP ID as PK)
      await db.insert(ordersV2).values({
        id: order.wpOrderId, // 🛡️ WP ID is nu de ID
        userId: order.user_id,
        journeyId: order.journeyId,
        statusId: order.statusId,
        paymentMethodId: order.paymentMethodId,
        amountNet: order.amountNet,
        amountTotal: order.total,
        purchaseOrder: order.purchaseOrder,
        billingEmailAlt: order.billingEmailAlt,
        createdAt: order.createdAt,
        legacyInternalId: order.id // 🛡️ Bewaar de hybride ID voor items
      }).onConflictDoUpdate({
        target: ordersV2.id,
        set: {
          journeyId: order.journeyId,
          statusId: order.statusId,
          paymentMethodId: order.payment_method_id,
          amountNet: order.amountNet,
          amountTotal: order.total,
          purchaseOrder: order.purchaseOrder,
          billingEmailAlt: order.billingEmailAlt,
          legacyInternalId: order.id
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
