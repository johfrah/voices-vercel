import { db } from '../../packages/database/src/index';
import { orders, orderItems, journeys, orderStatuses, paymentMethods, recordingSessions } from '../../packages/database/src/schema/index';
import { eq, and, sql } from 'drizzle-orm';

async function injectDecember2025() {
  console.log('🚀 Starting Atomic Injection: December 2025...');
  const startDate = process.env.MIGRATION_FROM || '2025-12-01';
  const endDate = process.env.MIGRATION_TO || '2026-01-01';

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
        sql`created_at >= ${startDate}`,
        sql`created_at < ${endDate}`
      )
    );

    console.log(`📊 Found ${decemberOrders.length} orders to process.`);

    for (const order of decemberOrders) {
      console.log(`🕵️ Processing Order ${order.id} (WP: ${order.wpOrderId})...`);

      const rawMeta = (order.rawMeta as any) || {};
      
      // 🧬 A. Determine Journey
      const defaultJourneyId =
        journeyMap['video'] ||
        journeyMap['agency_vo'] ||
        allJourneys.find(j => (j.code || '').includes('video'))?.id ||
        null;

      let journeyId = defaultJourneyId;
      if (order.journey === 'studio') {
        journeyId = journeyMap['studio'] || journeyId;
      } else if (rawMeta.usage === 'telefonie') {
        journeyId = journeyMap['telephony'] || journeyMap['agency_ivr'] || journeyId;
      } else if (rawMeta.usage === 'commercial' || rawMeta.usage === 'paid') {
        journeyId = journeyMap['commercial'] || journeyMap['agency_commercial'] || journeyId;
      }

      // 🚦 B. Map Status (Nuclear Logic: Workflow vs Transaction)
      let statusId = statusMap['completed_paid']; // Default
      
      if (order.status === 'wc-completed') {
        const isManual = ['bacs', 'manual_invoice', 'Invoice'].includes(rawMeta._payment_method);
        const hasPaidDate = !!rawMeta._date_paid || !!rawMeta._paid_date;
        
        if (isManual && !hasPaidDate) {
          statusId = statusMap['completed_unpaid']; // 🚩 Geleverd maar nog niet betaald
        }
      } else if (order.status === 'wc-pending' || order.status === 'wc-onbetaald') {
        statusId = statusMap['awaiting_payment'];
      } else if (order.status === 'wc-refunded') {
        statusId = statusMap['refunded'];
      }

      // 💳 C. Map Payment Method
      let paymentMethodId = null;
      const legacyMethod = String(rawMeta._payment_method || '').toLowerCase();
      if (legacyMethod.includes('bancontact')) {
        paymentMethodId = allMethods.find(m => m.code === 'mollie_bancontact')?.id || null;
      } else if (legacyMethod.includes('ideal')) {
        paymentMethodId = allMethods.find(m => m.code === 'mollie_ideal')?.id || null;
      } else if (legacyMethod.includes('bank') || legacyMethod.includes('bacs') || legacyMethod.includes('invoice')) {
        paymentMethodId = allMethods.find(m => m.code === 'manual_invoice')?.id
          || allMethods.find(m => m.code === 'mollie_banktransfer')?.id
          || null;
      }

      if (!paymentMethodId) {
        paymentMethodId = allMethods.find(m => m.code === 'manual_invoice')?.id
          || allMethods.find(m => m.code === 'mollie_banktransfer')?.id
          || null;
      }

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
