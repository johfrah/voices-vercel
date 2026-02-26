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
      
      // FIX: Gebruik OBJECT syntax voor postgres library om verwarring te voorkomen
      const [media] = await sql`
        INSERT INTO public.media ${sql({
          file_name: fileName,
          file_path: targetUrl,
          file_type: 'audio/mpeg',
          labels: ['demo', 'telephony'],
          journey: 'telephony'
        })}
        RETURNING id
      `;

      const [demo] = await sql`
        INSERT INTO public.actor_demos ${sql({
          actor_id: o.actor_id,
          name: `${o.company_name || 'Elite'} - Telefonie`,
          url: targetUrl,
          type: 'telephony',
          media_id: media.id,
          telephony_subtype_id: 5,
          is_public: true
        })}
        RETURNING id
      `;

      await sql`
        INSERT INTO public.media_intelligence ${sql({
          demo_id: demo.id,
          transcript: anonText,
          ai_metadata: { sector: o.sector || 'Algemeen' }
        })}
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
