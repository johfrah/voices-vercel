import { db } from '../../1-SITE/packages/database/src/index';
import { orders, orderItems, journeys, orderStatuses, paymentMethods, recordingSessions } from '../../1-SITE/packages/database/src/schema';
import { eq, and, sql } from 'drizzle-orm';

async function injectDecember2025() {
  console.log('🚀 Starting Atomic Injection: December 2025...');

  try {
    // 1. Fetch Master Data for Mapping
    const allJourneys = await db.select().from(journeys);
    const allStatuses = await db.select().from(orderStatuses);
    const allMethods = await db.select().from(paymentMethods);

    const journeyMap = Object.fromEntries(allJourneys.map(j => [j.code, j.id]));
    const statusMap = Object.fromEntries(allStatuses.map(s => [s.code, s.id]));
    const methodMap = Object.fromEntries(allMethods.map(m => [m.code, m.id])); 

    // 2. Fetch December 2025 Orders
    const decemberOrders = await db.select().from(orders).where(
      and(
        sql`created_at >= '2025-12-01'`,
        sql`created_at <= '2025-12-31'`
      )
    );

    console.log(`📊 Found ${decemberOrders.length} orders to process.`);

    for (const order of decemberOrders) {
      console.log(`🕵️ Processing Order ${order.id} (WP: ${order.wpOrderId})...`);

      const rawMeta = (order.rawMeta as any) || {};
      
      // 🧬 A. Determine Journey
      let journeyId = journeyMap['agency_vo']; // Default
      if (order.journey === 'studio') journeyId = journeyMap['studio'];
      else if (rawMeta.usage === 'telefonie') journeyId = journeyMap['agency_ivr'];
      else if (rawMeta.usage === 'commercial' || rawMeta.usage === 'paid') journeyId = journeyMap['agency_commercial'];

      // 🚦 B. Map Status
      let statusId = statusMap['completed'];
      if (order.status === 'wc-refunded') statusId = statusMap['refunded'];
      else if (order.status === 'wc-onbetaald') statusId = statusMap['unpaid'];

      // 💳 C. Map Payment Method
      let paymentMethodId = null;
      const legacyMethod = rawMeta._payment_method;
      if (legacyMethod?.includes('bancontact')) paymentMethodId = allMethods.find(m => m.code === 'mollie_bancontact')?.id;
      else if (legacyMethod?.includes('ideal')) paymentMethodId = allMethods.find(m => m.code === 'mollie_ideal')?.id;
      else if (legacyMethod === 'bacs' || legacyMethod === 'Invoice') paymentMethodId = allMethods.find(m => m.code === 'manual_invoice')?.id;

      // 💰 D. Calculate Net Amount
      const tax = parseFloat(rawMeta._order_tax || '0');
      const total = parseFloat(order.total as string || '0');
      const amountNet = total - tax;

      // 🏢 E. Extract B2B Info
      const po = rawMeta._billing_po || rawMeta.billing_po || null;
      const deptEmail = rawMeta._billing_department_email || null;

      // 🚀 F. UPDATE ORDER V2
      await db.update(orders).set({
        journeyId,
        statusId,
        paymentMethodId,
        amountNet: amountNet.toFixed(2),
        purchaseOrder: po,
        billingEmailAlt: deptEmail
      }).where(eq(orders.id, order.id));

      // 🎤 G. Create Recording Sessions for Agency
      if (order.journey === 'agency') {
        const items = await db.select({ id: orderItems.id }).from(orderItems).where(eq(orderItems.orderId, order.id));
        for (const item of items) {
          await db.insert(recordingSessions).values({
            orderId: order.id,
            orderItemId: item.id,
            status: 'active'
          }).onConflictDoNothing();
        }
      }
    }

    console.log('✅ Atomic Injection for December 2025 Completed.');
  } catch (error) {
    console.error('❌ Injection Failed:', error);
  }
  process.exit(0);
}

injectDecember2025();
