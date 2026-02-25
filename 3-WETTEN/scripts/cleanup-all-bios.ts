
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🚀 STARTING GLOBAL BIO CLEANUP (Nuclear Mode 2026)");

  // 1. Haal alle actors op die escape characters in hun bio hebben
  // We zoeken op letterlijke backslashes of \r\n
  const { data: actors, error: fetchError } = await supabase
    .from('actors')
    .select('id, first_name, last_name, bio')
    .or('bio.ilike.%\\\\%,bio.ilike.%\\r\\n%');

  if (fetchError) {
    console.error("❌ Error fetching actors:", fetchError.message);
    return;
  }

  if (!actors || actors.length === 0) {
    console.log("✅ Geen bio's met escape-characters gevonden.");
    return;
  }

  console.log(`🔍 Gevonden: ${actors.length} actors met vervuilde bio's.`);

  let successCount = 0;
  for (const actor of actors) {
    if (!actor.bio) continue;

    const oldBio = actor.bio;
    // Schoon de tekst op: \' -> ', \r\n -> \n, \n -> \n
    const cleanedBio = oldBio
      .replace(/\\'/g, "'")
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .trim();

    if (oldBio === cleanedBio) {
      console.log(`⏩ Skipping ${actor.first_name} ${actor.last_name || ''} (geen wijziging nodig na sanitatie)`);
      continue;
    }

    console.log(`🛠️ Cleaning bio for: ${actor.first_name} ${actor.last_name || ''} (ID: ${actor.id})`);

    const { error: updateError } = await supabase
      .from('actors')
      .update({ 
        bio: cleanedBio,
        is_manually_edited: true // Chris-Protocol: Lock record
      })
      .eq('id', actor.id);

    if (updateError) {
      console.error(`❌ Failed to update ID ${actor.id}:`, updateError.message);
    } else {
      successCount++;
    }
  }

  console.log(`\n🏁 CLEANUP COMPLETED: ${successCount} bio's opgeschoond en gelockt.`);
}

main();
