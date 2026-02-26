import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function identifyRecentTelephonyOrders() {
  console.log('🔍 [CHRIS-PROTOCOL] Identifying Recent Telephony Orders (2023-2026)...');

  try {
    // We zoeken in journey 'agency' naar producten die met telefonie te maken hebben
    const recentTelephony = await sql`
      SELECT 
        o.id, 
        o.wp_order_id,
        o.created_at, 
        o.journey,
        o.dropbox_folder_url,
        oi.name as product_name,
        oi.meta_data->>'briefing' as briefing,
        u.customer_insights->>'sector' as sector,
        a.first_name,
        a.last_name
      FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE o.created_at >= '2023-01-01'
        AND o.journey = 'agency'
        AND (
          oi.name ILIKE '%telefoon%' OR 
          oi.name ILIKE '%voicemail%' OR 
          oi.name ILIKE '%wacht%' OR 
          oi.name ILIKE '%IVR%' OR
          oi.name ILIKE '%keuzemenu%' OR
          oi.name ILIKE '%centrale%'
        )
      ORDER BY o.created_at DESC
      LIMIT 100
    `;

    console.log(`✅ Found ${recentTelephony.length} recent telephony items.`);

    console.log('\n--- RECENT TELEPHONY SAMPLES (2023-2026) ---');
    recentTelephony.slice(0, 15).forEach(s => {
      console.log(`Order ID: ${s.id} | Product: ${s.product_name} | Created: ${s.created_at.toISOString().split('T')[0]}`);
      console.log(`Actor: ${s.first_name} ${s.last_name} | Sector: ${s.sector || 'Onbekend'}`);
      console.log(`Briefing: ${s.briefing?.substring(0, 100) || 'GEEN BRIEFING'}...`);
      console.log(`Dropbox Path: ${s.dropbox_folder_url || 'Niet in DB'}`);
      console.log('-------------------');
    });

  } catch (error) {
    console.error('❌ Identification failed:', error);
  } finally {
    await sql.end();
  }
}

identifyRecentTelephonyOrders();
