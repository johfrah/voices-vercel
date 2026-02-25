
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllActorsDropboxUrl() {
  console.log("🔍 Checking for actors with dropbox_url missing 'visuals/' prefix in 'active/voicecards'...");

  const { data, error } = await supabase
    .from('actors')
    .select('id, first_name, dropbox_url')
    .ilike('dropbox_url', 'active/voicecards/%')
    .not('dropbox_url', 'ilike', 'visuals/%');

  if (error) {
    console.error("❌ Error fetching actors:", error.message);
    return;
  }

  console.log(`✅ Found ${data.length} actors missing 'visuals/' prefix in dropbox_url.`);
  
  for (const actor of data) {
    const oldUrl = actor.dropbox_url;
    const newUrl = `visuals/${oldUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`;
    
    console.log(`⏳ Updating actor ${actor.first_name} (ID ${actor.id}): ${oldUrl} -> ${newUrl}`);
    
    const { error: updateError } = await supabase
      .from('actors')
      .update({
        dropbox_url: newUrl,
        is_manually_edited: true
      } as any)
      .eq('id', actor.id);
      
    if (updateError) {
      console.error(`   ❌ Update failed for actor ${actor.first_name}:`, updateError.message);
    } else {
      console.log(`   ✅ Successfully updated actor ${actor.first_name}`);
    }
  }

  console.log("✅ ACTORS DROPBOX_URL FIX COMPLETE.");
}

checkAllActorsDropboxUrl();
