import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: FULL DATABASE 1 TRUTH AUDIT (v2.14.535)
 * 
 * Doel: Alle tabellen scannen op 'Hybrid Slop' (URL strings ipv media_id).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fullAudit() {
  console.log('🚀 [ATOMIC-AUDIT] Starting Full 1 Truth Audit...');

  // 1. Actors Photo Audit
  const { data: actorsSlop } = await supabase.from('actors').select('id, first_name, dropbox_url').not('dropbox_url', 'eq', '').not('dropbox_url', 'is', null);
  console.log(`📸 Actors with legacy dropbox_url: ${actorsSlop?.length || 0}`);

  // 2. Demos Audit
  const { data: demosSlop } = await supabase.from('actor_demos').select('id, name, url').is('media_id', null);
  console.log(`🎵 Demos without media_id: ${demosSlop?.length || 0}`);

  // 3. Videos Audit
  const { data: videosSlop } = await supabase.from('actor_videos').select('id, name, url').is('media_id', null);
  console.log(`📺 Videos without media_id: ${videosSlop?.length || 0}`);

  // 4. Workshops Audit
  const { data: workshopsSlop } = await supabase.from('workshops').select('id, title').is('media_id', null);
  console.log(`🎓 Workshops without media_id: ${workshopsSlop?.length || 0}`);

  console.log('\n🏁 [AUDIT COMPLETE]');
}

fullAudit().catch(console.error);
