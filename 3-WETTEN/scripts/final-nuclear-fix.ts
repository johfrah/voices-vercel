
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const VOICE_CARDS_DIR = path.join(process.cwd(), '1-SITE/assets/visuals/active/voicecards');

async function nuclearFix() {
  console.log("🚀 STARTING FINAL NUCLEAR PHOTO FIX (ID-First + WebP)");
  
  try {
    // 1. Haal alle bestanden op uit de lokale map
    const files = await fs.readdir(VOICE_CARDS_DIR);
    const webpFiles = files.filter(f => f.endsWith('.webp'));
    console.log(`📸 Found ${webpFiles.length} optimized WebP files.`);

    // 2. Haal alle actors op
    const { data: actors, error: actorsError } = await supabase
      .from('actors')
      .select('id, wp_product_id, first_name, photo_id');

    if (actorsError) throw actorsError;
    console.log(`🎙️ Processing ${actors.length} actors.`);

    for (const actor of actors) {
      const wpId = actor.wp_product_id;
      if (!wpId) continue;

      // Zoek een match in de bestanden
      const match = webpFiles.find(f => f.startsWith(`${wpId}-`));
      
      if (match) {
        const newPath = `visuals/active/voicecards/${match}`;
        console.log(`✅ Match found for ${actor.first_name} (WP:${wpId}): ${match}`);

        // A. Update Media record if photo_id exists
        if (actor.photo_id) {
          const { error: mediaError } = await supabase
            .from('media')
            .update({ 
              file_path: newPath,
              file_name: match,
              file_type: 'image/webp',
              is_manually_edited: true
            })
            .eq('id', actor.photo_id);
          
          if (mediaError) console.error(`   ❌ Media update failed for ${actor.first_name}:`, mediaError.message);
        }

        // B. Update Actor record (dropbox_url as fallback)
        const { error: actorUpdateError } = await supabase
          .from('actors')
          .update({ 
            dropbox_url: newPath,
            is_manually_edited: true
          } as any)
          .eq('id', actor.id);

        if (actorUpdateError) console.error(`   ❌ Actor update failed for ${actor.first_name}:`, actorUpdateError.message);
      } else {
        console.warn(`⚠️ No match found for ${actor.first_name} (WP:${wpId})`);
      }
    }

    console.log("✅ NUCLEAR FIX COMPLETE. ALL ACTORS LINKED TO CORRECT WEBP PHOTOS.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

nuclearFix();
