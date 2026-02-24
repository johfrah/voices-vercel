
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const actorId = 1718; // Kristien
  const legacyTagline = "Een bakker laat zijn brood toch ook niet verkopen door iemand die geen brood lust? Als bedrijf ben je elke dag op een professionele manier bezig met je product of dienst. Wanneer je klanten dan op een antwoordapparaat terecht komen dat ingesproken werd door een professionele stem, krijgen ze meer vertrouwen in jullie als bedrijf.";

  console.log(`🛠️ Herstellen tagline voor Kristien (ID: ${actorId})...`);

  const { data, error } = await supabase
    .from('actors')
    .update({ 
      tagline: legacyTagline,
      is_manually_edited: true // Chris-Protocol Lock
    })
    .eq('id', actorId)
    .select();

  if (error) {
    console.error("❌ Error updating tagline:", error.message);
  } else {
    console.log("✅ Tagline succesvol hersteld in Supabase.");
    console.log("Nieuwe tagline:", data[0].tagline);
  }
}

main();
