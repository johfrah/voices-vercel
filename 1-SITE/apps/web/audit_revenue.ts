import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from "drizzle-orm";
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env.local') });

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString!, { prepare: false });
const db = drizzle(client);

async function auditRevenue() {
  console.log("🔍 Diepe audit van de Studio omzet...");

  try {
    // 1. Haal alle orders op die meetellen voor de omzet
    const ordersRes = await db.execute(sql.raw(`
      SELECT 
        id, 
        wp_order_id, 
        total, 
        status, 
        created_at,
        raw_meta->>'billing_first_name' as first_name,
        raw_meta->>'billing_last_name' as last_name
      FROM orders 
      WHERE journey = 'studio' 
      AND status IN ('completed', 'wc-completed', 'processing', 'wc-processing')
      ORDER BY created_at DESC
    `));

    console.log(`\n--- Gevonden orders: ${ordersRes.length} ---`);
    
    // 2. Groepeer per jaar/maand om trends te zien
    const monthlyRes = await db.execute(sql.raw(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(total::numeric) as monthly_revenue,
        COUNT(*) as order_count
      FROM orders 
      WHERE journey = 'studio' 
      AND status IN ('completed', 'wc-completed', 'processing', 'wc-processing')
      GROUP BY month
      ORDER BY month DESC
    `));

    console.log("\n--- Omzet per maand ---");
    console.table(monthlyRes);

    // 3. Check op mogelijke test-orders of uitschieters
    const suspiciousOrders = await db.execute(sql.raw(`
      SELECT id, wp_order_id, total, status, created_at
      FROM orders 
      WHERE journey = 'studio' 
      AND (total::numeric > 2000 OR total::numeric = 0)
      AND status IN ('completed', 'wc-completed', 'processing', 'wc-processing')
    `));

    if (suspiciousOrders.length > 0) {
      console.log("\n⚠️ Verdachte orders (zeer hoog bedrag of €0):");
      console.table(suspiciousOrders);
    }

    // 4. Check op dubbele WP Order IDs (legacy import fouten)
    const duplicates = await db.execute(sql.raw(`
      SELECT wp_order_id, COUNT(*) 
      FROM orders 
      WHERE wp_order_id IS NOT NULL AND journey = 'studio'
      GROUP BY wp_order_id 
      HAVING COUNT(*) > 1
    `));

    if (duplicates.length > 0) {
      console.log("\n❌ DUBBELE WP ORDERS GEVONDEN:");
      console.table(duplicates);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

auditRevenue();
