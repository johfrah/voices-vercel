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

async function run() { 
  try {
    const studioOrders = await db.execute(sql.raw(`SELECT total, raw_meta->>'_order_tax' as tax FROM orders WHERE journey = 'studio' AND status IN ('completed', 'wc-completed', 'processing', 'wc-processing')`));
    const studioCosts = await db.execute(sql.raw(`SELECT amount, is_partner_payout FROM costs WHERE journey = 'studio'`));
    
    const totalRevenue = studioOrders.reduce((acc, o) => acc + (parseFloat(o.total as string) - parseFloat((o.tax as string) || '0')), 0);
    const externalCosts = studioCosts.filter(c => !c.is_partner_payout).reduce((acc, c) => acc + parseFloat(c.amount as string), 0);
    const partnerPayouts = studioCosts.filter(c => c.is_partner_payout).reduce((acc, c) => acc + parseFloat(c.amount as string), 0);
    const netProfit = totalRevenue - externalCosts - partnerPayouts;
    
    console.log('💰 Netto Omzet (excl. BTW): €', totalRevenue.toLocaleString('nl-BE'));
    console.log('📉 Externe Kosten: €', externalCosts.toLocaleString('nl-BE'));
    console.log('📉 Partner Payouts: €', partnerPayouts.toLocaleString('nl-BE'));
    console.log('-----------------------------------');
    console.log('📈 DE POT (WINST): €', netProfit.toLocaleString('nl-BE'));
    process.exit(0); 
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
} 
run();
