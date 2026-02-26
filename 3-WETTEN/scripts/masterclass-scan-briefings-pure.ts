import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanBriefingsPure() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning for PURE telephony briefings (excluding "video")...');

  try {
    const samples = await sql`
      SELECT 
        oi.id, 
        oi.order_id, 
        oi.name as product_name, 
        oi.meta_data->>'briefing' as briefing,
        o.created_at
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      WHERE o.created_at >= '2023-01-01'
        AND (
          oi.meta_data->>'briefing' ILIKE '%welkom%' OR 
          oi.meta_data->>'briefing' ILIKE '%voicemail%' OR 
          oi.meta_data->>'briefing' ILIKE '%wacht%' OR 
          oi.meta_data->>'briefing' ILIKE '%keuzemenu%' OR
          oi.meta_data->>'briefing' ILIKE '%buiten kantooruren%' OR
          oi.name ILIKE '%telefoon%' OR
          oi.name ILIKE '%voicemail%' OR
          oi.name ILIKE '%IVR%'
        )
        AND oi.meta_data->>'briefing' NOT ILIKE '%video%'
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    console.log(`✅ Found ${samples.length} items.`);
    samples.forEach(s => {
      console.log(`ID: ${s.id} | Order: ${s.order_id} | Product: ${s.product_name}`);
      console.log(`Briefing: ${s.briefing?.substring(0, 200)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanBriefingsPure();
