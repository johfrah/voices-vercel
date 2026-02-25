import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: DEMO-AUDIO TO MEDIA TABLE MIGRATION (v2.14.524)
 * 
 * Doel: Alle 'actor_demos' records die nog een hardcoded URL gebruiken 
 * omzetten naar een 'media_id' referentie in de 'media' tabel.
 * 
 * Dit is de "1 Truth" standaard voor audio.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateDemos() {
  console.log('🚀 [DEMO-MIGRATION] Starting migration to 1 Truth...');

  // 1. Haal alle demos op die nog geen media_id hebben
  const { data: demos, error: fetchError } = await supabase
    .from('actor_demos')
    .select('*')
    .is('media_id', null);

  if (fetchError) {
    console.error('❌ Error fetching demos:', fetchError);
    return;
  }

  console.log(`📊 Found ${demos.length} demos to migrate.`);

  let successCount = 0;
  let skipCount = 0;

  for (const demo of demos) {
    if (!demo.url) {
      skipCount++;
      continue;
    }

    try {
      // Extraheer het pad uit de URL
      // Voorbeeld: https://.../storage/v1/object/public/voices/active/demos/file.mp3
      // We willen: active/demos/file.mp3
      const urlParts = demo.url.split('/public/voices/');
      if (urlParts.length < 2) {
        console.warn(`⚠️ Could not parse path from URL: ${demo.url}`);
        skipCount++;
        continue;
      }

      const filePath = decodeURIComponent(urlParts[1]);
      const fileName = filePath.split('/').pop() || 'demo.mp3';

      // 2. Check of dit bestand al in de media tabel staat
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id')
        .eq('file_path', filePath)
        .single();

      let mediaId;

      if (existingMedia) {
        mediaId = existingMedia.id;
        console.log(`🔗 Found existing media for ${fileName} (ID: ${mediaId})`);
      } else {
        // 3. Maak nieuw media record aan
        const { data: newMedia, error: mediaError } = await supabase
          .from('media')
          .insert({
            file_name: fileName,
            file_path: filePath,
            file_type: 'audio/mpeg',
            journey: 'agency',
            category: 'voices',
            is_public: true,
            labels: ['migrated-demo-audio']
          })
          .select()
          .single();

        if (mediaError) {
          console.error(`❌ Failed to create media for ${fileName}:`, mediaError);
          continue;
        }
        mediaId = newMedia.id;
        console.log(`✅ Created new media for ${fileName} (ID: ${mediaId})`);
      }

      // 4. Update actor_demos met de nieuwe media_id
      const { error: updateError } = await supabase
        .from('actor_demos')
        .update({ media_id: mediaId })
        .eq('id', demo.id);

      if (updateError) {
        console.error(`❌ Failed to update demo ${demo.id}:`, updateError);
      } else {
        successCount++;
      }

    } catch (err) {
      console.error(`❌ Unexpected error processing demo ${demo.id}:`, err);
    }
  }

  console.log('\n🏁 [MIGRATION COMPLETE]');
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️ Skipped: ${skipCount}`);
  console.log(`Total processed: ${successCount + skipCount}`);
}

migrateDemos().catch(console.error);
