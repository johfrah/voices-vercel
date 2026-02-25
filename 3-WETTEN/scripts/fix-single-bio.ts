
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const actorId = 1719; // Sander Gillis
  console.log(`🛠️ Opschonen bio voor actor ID ${actorId} (Sander Gillis)...`);

  // 1. Haal huidige bio op
  const { data: actor, error: fetchError } = await supabase
    .from('actors')
    .select('bio')
    .eq('id', actorId)
    .single();

  if (fetchError || !actor) {
    console.error("❌ Error fetching actor:", fetchError?.message);
    return;
  }

  console.log("Oude bio:", JSON.stringify(actor.bio));

  // 2. Schoon de tekst op
  // Verwijder backslashes voor apostrofs en zet \r\n om naar echte newlines
  let cleanedBio = actor.bio
    .replace(/\\'/g, "'")       // \' -> '
    .replace(/\\r\\n/g, "\n")   // \r\n -> newline
    .replace(/\\n/g, "\n")      // \n -> newline
    .trim();

  console.log("Nieuwe bio:", JSON.stringify(cleanedBio));

  // 3. Update de database
  const { data: updateData, error: updateError } = await supabase
    .from('actors')
    .update({ 
      bio: cleanedBio,
      is_manually_edited: true // Chris-Protocol: Lock record
    })
    .eq('id', actorId)
    .select();

  if (updateError) {
    console.error("❌ Error updating bio:", updateError.message);
  } else {
    console.log("✅ Bio succesvol opgeschoond en record gelockt (is_manually_edited = true).");
  }
}

main();
