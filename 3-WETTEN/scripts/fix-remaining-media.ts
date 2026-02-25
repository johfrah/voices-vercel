
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRemainingMedia() {
  console.log("🚀 STARTING REMAINING MEDIA FIX (Prefix + WebP)");

  try {
    // 1. Haal alle media records op die nog op het oude pad staan
    const { data: mediaItems, error: mediaError } = await supabase
      .from('media')
      .select('id, file_path, file_name')
      .ilike('file_path', 'active/voicecards/%')
      .not('file_path', 'ilike', 'visuals/%');

    if (mediaError) throw mediaError;
    console.log(`📸 Found ${mediaItems.length} media records to fix.`);

    for (const item of mediaItems) {
      const oldPath = item.file_path;
      const fileName = item.file_name;
      
      // Construeer het nieuwe pad
      // We gaan ervan uit dat de WebP versie bestaat in de visuals/ map
      const newFileName = fileName.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const newPath = `visuals/${oldPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;

      console.log(`⏳ Updating media ID ${item.id}: ${oldPath} -> ${newPath}`);

      const { error: updateError } = await supabase
        .from('media')
        .update({
          file_path: newPath,
          file_name: newFileName,
          file_type: 'image/webp',
          is_manually_edited: true
        })
        .eq('id', item.id);

      if (updateError) {
        console.error(`   ❌ Update failed for ID ${item.id}:`, updateError.message);
      } else {
        console.log(`   ✅ Successfully updated ID ${item.id}`);
      }
    }

    console.log("✅ REMAINING MEDIA FIX COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

fixRemainingMedia();
