import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: PROXY-URL DEMO MIGRATION (v2.14.535)
 * 
 * Doel: De resterende 71 demo's die via een proxy-URL lopen 
 * ook omzetten naar de 1 Truth media_id standaard.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateProxyDemos() {
  console.log('🚀 [DEMO-MIGRATION] Starting Proxy-URL migration...');

  const { data: demos, error: fetchError } = await supabase
    .from('actor_demos')
    .select('*')
    .is('media_id', null);

  if (fetchError) return console.error(fetchError);

  console.log(`📊 Found ${demos.length} proxy demos to migrate.`);

  for (const demo of demos) {
    try {
      // Decodeer de proxy URL
      // Voorbeeld: /api/proxy/?path=https%3A%2F%2F...%2Fpublic%2Fvoices%2Fpath%2Fto%2Ffile.mp3
      const decodedUrl = decodeURIComponent(demo.url);
      const pathParts = decodedUrl.split('/public/voices/');
      
      if (pathParts.length < 2) {
        console.warn(`⚠️ Could not parse path from proxy URL: ${demo.url}`);
        continue;
      }

      const filePath = pathParts[1];
      const fileName = filePath.split('/').pop() || 'demo.mp3';

      // Check of media al bestaat
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id')
        .eq('file_path', filePath)
        .single();

      let mediaId;
      if (existingMedia) {
        mediaId = existingMedia.id;
      } else {
        const { data: newMedia, error: mediaError } = await supabase
          .from('media')
          .insert({
            file_name: fileName,
            file_path: filePath,
            file_type: 'audio/mpeg',
            journey: 'agency',
            category: 'voices',
            is_public: true,
            labels: ['migrated-proxy-demo']
          })
          .select()
          .single();

        if (mediaError) continue;
        mediaId = newMedia.id;
      }

      await supabase.from('actor_demos').update({ media_id: mediaId, url: "" }).eq('id', demo.id);
      console.log(`✅ Migrated proxy demo ${demo.id} -> Media ID ${mediaId}`);

    } catch (err) {
      console.error(`❌ Error demo ${demo.id}:`, err);
    }
  }

  console.log('\n🏁 [PROXY MIGRATION COMPLETE]');
}

migrateProxyDemos().catch(console.error);
