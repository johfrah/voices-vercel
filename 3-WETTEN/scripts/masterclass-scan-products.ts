import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanProducts() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning product names from recent orders...');

  try {
    const products = await sql`
      SELECT oi.name, COUNT(*) as count
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      WHERE o.created_at >= '2025-01-01'
      GROUP BY oi.name
      ORDER BY count DESC
      LIMIT 50
    `;

    console.log('\n--- POPULAR PRODUCTS SINCE 2025 ---');
    products.forEach(p => console.log(`${p.count}x | ${p.name}`));

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanProducts();
