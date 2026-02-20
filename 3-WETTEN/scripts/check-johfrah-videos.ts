import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVideos() {
  console.log("🔍 Checking videos for Johfrah...");
  
  const { data: actors, error: actorError } = await supabase
    .from('actors')
    .select('id, first_name')
    .ilike('first_name', 'Johfrah')
    .single();

  if (actorError || !actors) {
    console.error("❌ Actor not found:", actorError);
    return;
  }

  console.log(`✅ Found Johfrah (ID: ${actors.id})`);

  const { data: videos, error: videoError } = await supabase
    .from('actor_videos')
    .select('*')
    .eq('actor_id', actors.id);

  if (videoError) {
    console.error("❌ Error fetching videos:", videoError);
    return;
  }

  console.log(`🎬 Found ${videos?.length || 0} videos:`);
  videos?.forEach(v => console.log(`   - ${v.name}: ${v.url}`));
}

checkVideos();
