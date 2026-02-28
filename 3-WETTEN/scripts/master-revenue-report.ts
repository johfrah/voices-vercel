import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../1-SITE/packages/database/src/schema/index';

async function masterRevenueReport() {
  console.log('📊 [MASTERCLASS] Master Revenue Report (2023-2026)\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL missing');
    process.exit(1);
  }

  const sql = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });

  try {
    const stats = await sql`
      SELECT 
        w.label as world_label,
        COUNT(o.id) as order_count,
        SUM(o.total::numeric) as total_revenue,
        ROUND(AVG(o.total::numeric), 2) as avg_order_value
      FROM orders o
      JOIN worlds w ON o.world_id = w.id
      GROUP BY w.label
      ORDER BY total_revenue DESC
    `;

    const total = await sql`
      SELECT 
        COUNT(id) as total_orders,
        SUM(total::numeric) as grand_total_revenue
      FROM orders
    `;

    console.log('--- 🌍 OPBRENGST PER WORLD ---');
    console.table(stats);

    console.log('\n--- 💰 OVERKOEPELEND TOTAAL ---');
    console.log(`Totaal Aantal Orders: ${total[0].total_orders}`);
    console.log(`Totale Omzet: €${parseFloat(total[0].grand_total_revenue).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}`);

    const unknown = await sql`
      SELECT COUNT(id) as count, SUM(total::numeric) as revenue
      FROM orders
      WHERE world_id IS NULL
    `;

    if (unknown[0].count > 0) {
      console.log(`\n⚠️  Let op: Er zijn nog ${unknown[0].count} orders zonder World-label (€${parseFloat(unknown[0].revenue).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}).`);
      console.log('Dit zijn waarschijnlijk de Freelance/B2B orders die nog handmatig gelabeld moeten worden.');
    }

  } catch (error) {
    console.error('❌ Report Failed:', error);
  }
  process.exit(0);
}

masterRevenueReport();
