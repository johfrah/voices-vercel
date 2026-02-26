import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function debugRecentOrders() {
  console.log('🔍 [CHRIS-PROTOCOL] Debugging order dates and journeys...');

  try {
    // 1. Wat is de meest recente order datum?
    const latestOrder = await sql`SELECT created_at FROM public.orders ORDER BY created_at DESC LIMIT 1`;
    console.log(`Latest order date: ${latestOrder[0]?.created_at}`);

    // 2. Hoeveel orders zijn er per jaar?
    const countsPerYear = await sql`
      SELECT EXTRACT(YEAR FROM created_at) as year, COUNT(*) as count 
      FROM public.orders 
      GROUP BY year 
      ORDER BY year DESC
    `;
    console.log('\n--- ORDERS PER YEAR ---');
    countsPerYear.forEach(c => console.log(`${c.year}: ${c.count}`));

    // 3. Welke journeys zijn er in de laatste 3 jaar?
    const journeys = await sql`
      SELECT journey, COUNT(*) as count 
      FROM public.orders 
      WHERE created_at >= '2023-01-01'
      GROUP BY journey
    `;
    console.log('\n--- JOURNEYS SINCE 2023 ---');
    journeys.forEach(j => console.log(`${j.journey || 'NULL'}: ${j.count}`));

    // 4. Sample van recente orders om journey namen te checken
    const samples = await sql`
      SELECT id, journey, created_at 
      FROM public.orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    console.log('\n--- RECENT SAMPLES ---');
    samples.forEach(s => console.log(`ID: ${s.id} | Journey: ${s.journey} | Date: ${s.created_at}`));

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await sql.end();
  }
}

debugRecentOrders();
