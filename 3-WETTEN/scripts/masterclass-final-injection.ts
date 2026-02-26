import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function finalMasterclassInjection() {
  console.log('🧹 [CHRIS-PROTOCOL] Final Attempt: Safe SQL Injection...');

  try {
    // 1. Wipe
    await sql`DELETE FROM public.actor_demos WHERE type = 'telephony' AND name ILIKE '%Telefonie%'`;
    console.log('✅ Database wiped.');

    // 2. Haal 14 ECHTE orders op
    const orders = await sql`
      SELECT 
        oi.id as item_id,
        o.id as order_id,
        oi.actor_id,
        a.first_name,
        a.last_name,
        oi.meta_data->>'script' as script,
        oi.meta_data->>'briefing' as briefing,
        u.customer_insights->>'company' as company_name,
        u.customer_insights->>'sector' as sector
      FROM public.order_items oi
      JOIN public.orders o ON oi.order_id = o.id
      JOIN public.actors a ON oi.actor_id = a.id
      LEFT JOIN public.users u ON o.user_id = u.id
      WHERE (oi.meta_data->>'script' IS NOT NULL OR oi.meta_data->>'briefing' IS NOT NULL)
      ORDER BY o.created_at DESC
      LIMIT 14
    `;

    let successCount = 0;
    for (const o of orders) {
      const rawText = o.script || o.briefing || "Demo tekst voor telefonie.";
      const anonText = rawText.replace(new RegExp(o.company_name || 'Klant', 'gi'), '{{company_name}}');

      const fileName = `demo_${o.item_id}.mp3`;
      const targetUrl = `https://storage.voices.be/demos/telephony/${fileName}`;
      
      // FIX: Gebruik de postgres library helper voor arrays
      const [media] = await sql`
        INSERT INTO public.media (file_name, file_path, file_type, labels, journey)
        VALUES (${fileName}, ${targetUrl}, 'audio/mpeg', ${sql.array(['demo', 'telephony'])}, 'telephony')
        RETURNING id
      `;

      const [demo] = await sql`
        INSERT INTO public.actor_demos (actor_id, name, url, type, media_id, telephony_subtype_id, is_public)
        VALUES (${o.actor_id}, ${o.company_name || 'Elite'} - Telefonie, ${targetUrl}, 'telephony', ${media.id}, 5, true)
        RETURNING id
      `;

      await sql`
        INSERT INTO public.media_intelligence (demo_id, transcript, ai_metadata)
        VALUES (${demo.id}, ${anonText}, ${JSON.stringify({ sector: o.sector || 'Algemeen' })})
      `;

      successCount++;
    }

    console.log(`\n🏁 SUCCESS: ${successCount} demos live.`);
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await sql.end();
  }
}

finalMasterclassInjection();
