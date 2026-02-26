import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanProductsTable() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning "products" table structure...');

  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND table_schema = 'public'
    `;
    console.log('\n--- PRODUCTS COLUMNS ---');
    columns.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

    const products = await sql`
      SELECT * FROM public.products 
      WHERE name ILIKE '%voicemail%' OR name ILIKE '%begroeting%' OR name ILIKE '%wacht%' OR name ILIKE '%IVR%'
    `;
    console.log('\n--- TELEPHONY PRODUCTS ---');
    console.table(products);

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanProductsTable();
