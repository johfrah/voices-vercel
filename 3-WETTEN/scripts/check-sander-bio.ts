
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Zoeken naar Sander Gillis in de live database...");

  const { data, error } = await supabase
    .from('actors')
    .select('id, first_name, last_name, email, bio, pending_bio, status, is_public')
    .ilike('first_name', 'Sander')
    .ilike('last_name', 'Gillis');

  if (error) {
    console.error("❌ Error fetching actor:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log("✅ Gevonden actor(s):");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log("⚠️ Sander Gillis niet gevonden in de live database.");
    
    // Probeer breder te zoeken op bio tekst
    console.log("🔍 Zoeken op bio fragment...");
    const { data: bioData, error: bioError } = await supabase
      .from('actors')
      .select('id, first_name, last_name, email, bio, pending_bio, status, is_public')
      .or(`bio.ilike.%Ketnetwrapper%,pending_bio.ilike.%Ketnetwrapper%`);
      
    if (bioError) {
      console.error("❌ Error searching bio:", bioError.message);
    } else if (bioData && bioData.length > 0) {
      console.log("✅ Gevonden via bio fragment:");
      console.log(JSON.stringify(bioData, null, 2));
    } else {
      console.log("⚠️ Niets gevonden via bio fragment.");
    }
  }
}

main();
