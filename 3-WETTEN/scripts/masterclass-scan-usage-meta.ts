import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanUsageMetaData() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning order_items for usage=telefonie in meta_data...');

  try {
    // We zoeken in zowel meta_data als meta kolommen naar 'usage' of 'telefonie' patronen
    const samples = await sql`
      SELECT 
        oi.id, 
        oi.order_id, 
        oi.name as product_name, 
        oi.meta_data,
        oi.meta,
        o.created_at
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      WHERE (
        oi.meta_data::text ILIKE '%usage%' OR 
        oi.meta_data::text ILIKE '%telefonie%' OR
        oi.meta::text ILIKE '%usage%' OR 
        oi.meta::text ILIKE '%telefonie%'
      )
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    console.log(`✅ Found ${samples.length} items with usage/telefonie in meta.`);
    samples.forEach(s => {
      console.log(`ID: ${s.id} | Order: ${s.order_id} | Product: ${s.product_name} | Date: ${s.created_at.toISOString().split('T')[0]}`);
      console.log(`Meta Data: ${JSON.stringify(s.meta_data, null, 2)}`);
      console.log(`Meta: ${JSON.stringify(s.meta, null, 2)}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanUsageMetaData();
