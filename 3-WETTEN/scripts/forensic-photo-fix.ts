
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function forensicPhotoFix() {
  console.log("🚀 STARTING FORENSIC PHOTO FIX (GOD MODE 2026)");

  try {
    // 1. Haal alle media op die recent zijn geüpload via de verkeerde route
    // Deze staan vaak in uploads/agency/voices/ of agency/voices/misc/
    const { data: mediaItems, error: mediaError } = await supabase
      .from('media')
      .select('id, file_path, file_name')
      .or('file_path.ilike.uploads/agency/voices/%,file_path.ilike.agency/voices/misc/%,file_path.ilike.active/voicecards/%');

    if (mediaError) throw mediaError;
    console.log(`📸 Found ${mediaItems.length} potentially misplaced media records.`);

    // 2. Haal alle acteurs op
    const { data: actors, error: actorsError } = await supabase
      .from('actors')
      .select('id, first_name, photo_id, dropbox_url');

    if (actorsError) throw actorsError;
    console.log(`🎙️ Checking ${actors.length} actors for broken links.`);

    for (const actor of actors) {
      let needsUpdate = false;
      const updateData: any = {};

      // FIX A: photo_id mismatch
      // Als de acteur een dropbox_url heeft die naar een /api/proxy wijst maar geen photo_id heeft
      if (actor.dropbox_url?.includes('/api/proxy') && !actor.photo_id) {
        console.log(`🔍 Actor ${actor.first_name} (ID ${actor.id}) has proxied URL but no photo_id.`);
        
        // Probeer de media record te vinden op basis van de bestandsnaam in de URL
        const fileNameMatch = actor.dropbox_url.match(/path=([^&]+)/);
        if (fileNameMatch) {
          const decodedPath = decodeURIComponent(fileNameMatch[1]);
          const fileName = decodedPath.split('/').pop();
          
          const matchingMedia = mediaItems.find(m => m.file_name === fileName || m.file_path === decodedPath);
          if (matchingMedia) {
            console.log(`   ✅ Found matching media ID ${matchingMedia.id}. Linking...`);
            updateData.photo_id = matchingMedia.id;
            needsUpdate = true;
          }
        }
      }

      // FIX B: Dubbele proxy URLs in dropbox_url
      if (actor.dropbox_url?.includes('https://www.voices.be/api/proxy')) {
        const cleanUrl = actor.dropbox_url.replace('https://www.voices.be', '');
        console.log(`   🛠️ Cleaning double proxy URL for ${actor.first_name}: ${cleanUrl}`);
        updateData.dropbox_url = cleanUrl;
        needsUpdate = true;
      }

      // FIX C: photo_id bestaat maar dropbox_url is leeg of oud
      if (actor.photo_id && (!actor.dropbox_url || actor.dropbox_url.includes('dropbox.com'))) {
        const { data: mediaItem } = await supabase.from('media').select('file_path').eq('id', actor.photo_id).single();
        if (mediaItem) {
          const newProxyUrl = `/api/proxy/?path=${encodeURIComponent(mediaItem.file_path)}`;
          console.log(`   ✅ Updating dropbox_url from photo_id for ${actor.first_name}: ${newProxyUrl}`);
          updateData.dropbox_url = newProxyUrl;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        console.log(`⏳ Saving changes for actor ${actor.first_name}...`);
        const { error: updateError } = await supabase
          .from('actors')
          .update({
            ...updateData,
            is_manually_edited: true
          } as any)
          .eq('id', actor.id);

        if (updateError) {
          console.error(`   ❌ Update failed:`, updateError.message);
        } else {
          console.log(`   ✅ Success.`);
        }
      }
    }

    console.log("✅ FORENSIC PHOTO FIX COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

forensicPhotoFix();
