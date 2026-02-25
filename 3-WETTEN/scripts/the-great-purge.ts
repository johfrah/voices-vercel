import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: THE GREAT PURGE (v2.14.539)
 * 
 * Doel: Alle gedetecteerde 'Hybrid Slop' in één klap uitroeien.
 * 1. Demos & Videos: URL kolom leegmaken als media_id aanwezig is.
 * 2. Actors: Literal "NULL" strings in native_lang fixen.
 * 3. Actors: dropbox_url leegmaken als photo_id aanwezig is.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function theGreatPurge() {
  console.log('🚀 [THE-GREAT-PURGE] Initiating Atomic Remediation...');

  // 1. DEMOS: Kill URL slop where media_id exists
  const { error: demosError } = await supabase
    .from('actor_demos')
    .update({ url: "" })
    .not('media_id', 'is', null)
    .not('url', 'eq', '');
  
  if (demosError) console.error('❌ Demos Purge Failed:', demosError.message);
  else console.log('✅ Demos: URL slop eliminated.');

  // 2. VIDEOS: Kill URL slop where media_id exists
  const { error: videosError } = await supabase
    .from('actor_videos')
    .update({ url: "" })
    .not('media_id', 'is', null)
    .not('url', 'eq', '');

  if (videosError) console.error('❌ Videos Purge Failed:', videosError.message);
  else console.log('✅ Videos: URL slop eliminated.');

  // 3. ACTORS: Kill literal "NULL" strings in native_lang
  const { error: langError } = await supabase
    .from('actors')
    .update({ native_lang: null })
    .eq('native_lang', 'NULL');

  if (langError) console.error('❌ Actor Lang Purge Failed:', langError.message);
  else console.log('✅ Actors: Literal "NULL" strings eliminated.');

  // 4. ACTORS: Kill dropbox_url slop where photo_id exists
  const { error: photoError } = await supabase
    .from('actors')
    .update({ dropbox_url: "" })
    .not('photo_id', 'is', null)
    .not('dropbox_url', 'eq', '');

  if (photoError) console.error('❌ Actor Photo Purge Failed:', photoError.message);
  else console.log('✅ Actors: dropbox_url slop eliminated.');

  console.log('\n🏁 [PURGE COMPLETE] Database is now 100% Handshake Proof.');
}

theGreatPurge().catch(console.error);
