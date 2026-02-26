import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function identifyTelephonySamples() {
  console.log('🔍 [CHRIS-PROTOCOL] Broadening Search for Telephony Samples...');

  try {
    // We zoeken breder: journey 'agency' met specifieke producten of meta data
    const samples = await sql`
      SELECT 
        oi.id as item_id,
        oi.order_id,
        oi.actor_id,
        oi.name as product_name,
        oi.dropbox_url,
        oi.delivery_file_url,
        oi.meta_data,
        oi.meta,
        o.journey,
        o.user_id,
        a.first_name,
        a.last_name
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      WHERE (o.journey IN ('telephony', 'agency'))
        AND (oi.dropbox_url IS NOT NULL OR oi.delivery_file_url IS NOT NULL)
        AND (
          oi.name ILIKE '%telefoon%' OR 
          oi.name ILIKE '%voicemail%' OR 
          oi.name ILIKE '%wacht%' OR 
          oi.name ILIKE '%IVR%' OR
          oi.meta_data::text ILIKE '%telefoon%' OR
          oi.meta_data::text ILIKE '%voicemail%'
        )
      ORDER BY o.created_at DESC
      LIMIT 100
    `;

    console.log(`✅ Found ${samples.length} potential telephony candidates.`);

    samples.slice(0, 5).forEach(s => {
      console.log(`Item: ${s.item_id} | Product: ${s.product_name} | Journey: ${s.journey}`);
      console.log(`Briefing: ${s.meta_data?.briefing?.substring(0, 100) || 'Geen briefing in meta_data'}`);
      console.log(`Meta briefing: ${s.meta?.briefing?.substring(0, 100) || 'Geen briefing in meta'}`);
      console.log(`Audio: ${s.dropbox_url || s.delivery_file_url}`);
      console.log('-------------------');
    });

  } catch (error) {
    console.error('❌ Identification failed:', error);
  } finally {
    await sql.end();
  }
}

identifyTelephonySamples();
