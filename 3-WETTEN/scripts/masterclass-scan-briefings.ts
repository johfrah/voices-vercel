import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function scanBriefings() {
  console.log('🔍 [CHRIS-PROTOCOL] Scanning briefings for telephony keywords (since 2023)...');

  try {
    const samples = await sql`
      SELECT 
        oi.id, 
        oi.order_id, 
        oi.name as product_name, 
        oi.meta_data->>'briefing' as briefing,
        o.created_at,
        o.dropbox_folder_url,
        a.first_name,
        a.last_name
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      WHERE o.created_at >= '2023-01-01'
        AND (
          oi.meta_data->>'briefing' ILIKE '%telefoon%' OR 
          oi.meta_data->>'briefing' ILIKE '%voicemail%' OR 
          oi.meta_data->>'briefing' ILIKE '%wacht%' OR 
          oi.meta_data->>'briefing' ILIKE '%IVR%' OR
          oi.meta_data->>'briefing' ILIKE '%keuzemenu%' OR
          oi.meta_data->>'briefing' ILIKE '%welkomst%'
        )
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    console.log(`✅ Found ${samples.length} items with telephony keywords in briefing.`);
    samples.forEach(s => {
      console.log(`ID: ${s.id} | Order: ${s.order_id} | Product: ${s.product_name} | Date: ${s.created_at.toISOString().split('T')[0]}`);
      console.log(`Actor: ${s.first_name} ${s.last_name}`);
      console.log(`Briefing: ${s.briefing?.substring(0, 150)}...`);
      console.log(`Dropbox: ${s.dropbox_folder_url || 'NULL'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Scan failed:', error);
  } finally {
    await sql.end();
  }
}

scanBriefings();
