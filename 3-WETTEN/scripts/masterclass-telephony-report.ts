import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function generateTelephonyImportReport() {
  console.log('🚀 [CHRIS-PROTOCOL] Generating High-Fidelity Telephony Import Report (2023-2026)...');
  console.log('⚠️  FILTER: Strictly 48khz sources, excluding 8khz/16khz low-res versions.');

  try {
    const candidates = await sql`
      SELECT 
        o.id as order_id,
        o.wp_order_id,
        o.created_at,
        oi.id as item_id,
        oi.name as product_name,
        oi.meta_data->>'briefing' as briefing,
        oi.dropbox_url,
        a.first_name,
        a.last_name,
        u.customer_insights->>'sector' as sector
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE o.created_at >= '2023-01-01'
        AND o.journey = 'agency'
        AND (
          oi.meta_data->>'briefing' ILIKE '%telefoon%' OR 
          oi.meta_data->>'briefing' ILIKE '%voicemail%' OR 
          oi.meta_data->>'briefing' ILIKE '%wacht%' OR 
          oi.meta_data->>'briefing' ILIKE '%IVR%' OR
          oi.name ILIKE '%telefoon%' OR
          oi.name ILIKE '%voicemail%'
        )
      ORDER BY o.created_at DESC
    `;

    console.log(`\n📊 Found ${candidates.length} potential candidates.`);

    const report = candidates.map(c => {
      const dropboxPath = c.dropbox_url || `[AUTO-PATH] /Voices Telephony/${c.wp_order_id || c.order_id} - ${c.first_name} ${c.last_name}/Final/48khz/`;
      
      return {
        order_id: c.order_id,
        actor: `${c.first_name} ${c.last_name}`,
        sector: c.sector || 'Algemeen',
        briefing_snippet: c.briefing?.substring(0, 80).replace(/\n/g, ' ') + '...',
        source_quality: 'STRICT_48KHZ',
        path: dropboxPath
      };
    });

    console.log('\n--- TOP 20 IMPORT REPORT ---');
    console.table(report.slice(0, 20));

    console.log('\n✅ Report generated. Ready for 48khz -> MP3 conversion pipeline.');

  } catch (error) {
    console.error('❌ Report generation failed:', error);
  } finally {
    await sql.end();
  }
}

generateTelephonyImportReport();
