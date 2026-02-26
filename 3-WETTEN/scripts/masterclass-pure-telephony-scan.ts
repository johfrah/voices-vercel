import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function findPureTelephonySamples() {
  console.log('🛡️ [CHRIS-PROTOCOL] Broadening search for PURE Telephony (2023-2026)...');

  try {
    const candidates = await sql`
      SELECT 
        oi.id, 
        oi.order_id, 
        oi.name as product_name, 
        oi.meta_data->>'briefing' as briefing,
        o.created_at,
        a.first_name,
        a.last_name
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      WHERE o.created_at >= '2023-01-01'
        AND o.journey = 'agency'
        -- Positieve filters
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
        -- Negatieve filters (GEEN VIDEO/COMMERCIAL)
        AND NOT (
          oi.meta_data->>'briefing' ILIKE '%video%' OR 
          oi.meta_data->>'briefing' ILIKE '%beeld%' OR 
          oi.meta_data->>'briefing' ILIKE '%film%' OR 
          oi.meta_data->>'briefing' ILIKE '%commercial%' OR
          oi.meta_data->>'briefing' ILIKE '%spot%' OR
          oi.meta_data->>'briefing' ILIKE '%scène%' OR
          oi.name ILIKE '%video%' OR
          oi.name ILIKE '%film%'
        )
      ORDER BY o.created_at DESC
      LIMIT 50
    `;

    console.log(`\n✅ Found ${candidates.length} PURE telephony candidates.`);
    candidates.forEach(s => {
      console.log(`ID: ${s.id} | Order: ${s.order_id} | Product: ${s.name || s.product_name}`);
      console.log(`Briefing: ${s.briefing?.substring(0, 150)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Filtering failed:', error);
  } finally {
    await sql.end();
  }
}

findPureTelephonySamples();
