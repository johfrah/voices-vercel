
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Inspecting Migration Examples for Kristien [ID: 1718]...\n");

  // 1. Fetch Actor to get logo_id
  const { data: actor, error: actorError } = await supabase
    .from('actors')
    .select('id, first_name, logo_id')
    .eq('id', 1718)
    .single();

  if (actorError) {
    console.error("❌ Error fetching actor:", actorError.message);
    return;
  }

  console.log(`Actor: ${actor.first_name} [ID: ${actor.id}]`);
  console.log(`Linked Logo ID: ${actor.logo_id}`);

  if (actor.logo_id) {
    // 2. Fetch Media record separately
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .eq('id', actor.logo_id)
      .single();

    if (mediaError) {
      console.error("❌ Error fetching media record:", mediaError.message);
    } else {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/voices/${media.file_path}`;
      console.log("\n--- 🖼️ LOGO EXAMPLE ---");
      console.log(`Media ID: ${media.id}`);
      console.log(`File Name: ${media.file_name}`);
      console.log(`Category: ${media.category}`);
      console.log(`Storage Path: ${media.file_path}`);
      console.log(`Public URL: ${publicUrl}`);
    }
  }

  // 3. Check Demo in actor_demos table
  const { data: demos, error: demoError } = await supabase
    .from('actor_demos')
    .select('id, name, url')
    .eq('actor_id', 1718)
    .ilike('url', '%audio-gallery%') // Filter for our new uploads
    .limit(1);

  if (demoError) {
    console.error("\n❌ Error fetching actor demos:", demoError.message);
  } else {
    console.log("\n--- 🎙️ DEMO EXAMPLE (New Upload) ---");
    if (demos && demos.length > 0) {
      const d = demos[0];
      console.log(`Name: "${d.name}"`);
      console.log(`URL: ${d.url}`);
    } else {
      console.log("No new audio-gallery demos found for this actor.");
    }
  }
}

main();
