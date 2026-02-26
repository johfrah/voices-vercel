import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanAllBriefings() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning ALL briefings for any telephony content...');

  try {
    const samples = await sql`
      SELECT 
        oi.id, 
        oi.name, 
        oi.meta_data,
        o.created_at
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      WHERE (oi.meta_data::text ILIKE '%welkom%' 
         OR oi.meta_data::text ILIKE '%bellen%'
         OR oi.meta_data::text ILIKE '%voicemail%')
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    console.log(`✅ Found ${samples.length} items with telephony keywords.`);
    samples.forEach(s => {
      console.log(`ID: ${s.id} | Name: ${s.name} | Date: ${s.created_at}`);
      console.log(`Meta Keys: ${Object.keys(s.meta_data || {}).join(', ')}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanAllBriefings();
