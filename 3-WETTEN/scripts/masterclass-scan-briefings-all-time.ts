import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanBriefingsAllTime() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning ALL briefings for pure telephony (no "video")...');

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
      WHERE (
          oi.meta_data->>'briefing' ILIKE '%welkom%' OR 
          oi.meta_data->>'briefing' ILIKE '%voicemail%' OR 
          oi.meta_data->>'briefing' ILIKE '%wacht%' OR 
          oi.meta_data->>'briefing' ILIKE '%keuzemenu%' OR
          oi.meta_data->>'briefing' ILIKE '%buiten kantooruren%'
        )
        AND oi.meta_data->>'briefing' NOT ILIKE '%video%'
        AND oi.meta_data->>'briefing' NOT ILIKE '%film%'
        AND oi.meta_data->>'briefing' NOT ILIKE '%beeld%'
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    console.log(`✅ Found ${samples.length} items.`);
    samples.forEach(s => {
      console.log(`ID: ${s.id} | Order: ${s.order_id} | Product: ${s.product_name} | Date: ${s.created_at}`);
      console.log(`Briefing: ${s.briefing?.substring(0, 200)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanBriefingsAllTime();
