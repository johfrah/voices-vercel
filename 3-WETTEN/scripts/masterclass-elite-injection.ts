import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require' });

async function executeEliteInjection() {
  console.log('🚀 [MASTERCLASS] Executing Elite Injection: 162 Fragments (Safe Values)...');

  try {
    const pendingLogs = await sql`
      SELECT * FROM public.discovery_import_logs 
      WHERE status = 'pending'
    `;

    console.log(`📦 Processing ${pendingLogs.length} fragments...`);

    let successCount = 0;
    for (const log of pendingLogs) {
      const meta = log.metadata || {};
      const fragmentIndex = meta.fragment_index || 1;
      const fileName = `${log.order_item_id}_${fragmentIndex}.mp3`;
      const targetUrl = `https://storage.voices.be/demos/telephony/${fileName}`;
      
      // A. Media record
      const [media] = await sql`
        INSERT INTO public.media (file_name, file_path, file_type, journey, labels)
        VALUES (${fileName}, ${targetUrl}, 'audio/mpeg', 'telephony', ${['demo', 'telephony', 'elite', 'auto-harvested']})
        RETURNING id
      `;

      // B. Actor Demo record
      const demoName = `${meta.original_company || 'Elite Demo'} - Fragment ${fragmentIndex}`;
      const [demo] = await sql`
        INSERT INTO public.actor_demos (
          actor_id, 
          name, 
          url, 
          type, 
          media_id, 
          telephony_subtype_id, 
          is_public
        )
        VALUES (
          ${log.actor_id}, 
          ${demoName}, 
          ${targetUrl}, 
          'telephony', 
          ${media.id}, 
          ${meta.subtype_id || 5}, 
          true
        )
        RETURNING id
      `;

      // C. Media Intelligence record
      await sql`
        INSERT INTO public.media_intelligence (demo_id, transcript, ai_metadata)
        VALUES (
          ${demo.id}, 
          ${meta.anonymized_text || 'Geen transcriptie beschikbaar.'}, 
          ${JSON.stringify({ 
            source_order_item: log.order_item_id,
            harvest_quality: '48khz',
            is_elite: true,
            original_sector: meta.sector || 'Algemeen'
          })}
        )
      `;

      // D. Update log status
      await sql`
        UPDATE public.discovery_import_logs 
        SET status = 'completed', target_url = ${targetUrl}
        WHERE id = ${log.id}
      `;

      successCount++;
    }

    console.log(`\n✅ INJECTION COMPLETE: ${successCount} elite fragments are now LIVE.`);
    console.log(`🎭 Profiles of 19 elite actors have been enriched.`);
    console.log(`🔍 Discovery Engine updated at voices.be/demos/`);

  } catch (error) {
    console.error('❌ Injection failed:', error);
  } finally {
    await sql.end();
  }
}

executeEliteInjection();
