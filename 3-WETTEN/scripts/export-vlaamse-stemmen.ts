
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportVlaamseStemmen() {
  console.log("🔍 Ophalen van Vlaamse stemmen uit database...");
  
  // Haal de taal ID voor Vlaams op
  const { data: langData } = await supabase
    .from('languages')
    .select('id')
    .eq('code', 'nl-be')
    .single();

  if (!langData) {
    console.error("❌ Taal 'nl-be' niet gevonden.");
    process.exit(1);
  }

  // Haal alle actors op die Vlaams als taal hebben
  const { data: actors, error } = await supabase
    .from('actors')
    .select(`
      first_name,
      last_name,
      email,
      actor_languages!inner(language_id)
    `)
    .eq('actor_languages.language_id', langData.id)
    .eq('status', 'live');

  if (error) {
    console.error("❌ Error bij ophalen actors:", error);
    process.exit(1);
  }

  console.log("\n### Vlaamse Stemmen (Live)\n");
  console.log("| Voornaam | Achternaam | Emailadres |");
  console.log("| :--- | :--- | :--- |");
  
  actors.forEach(a => {
    console.log(`| ${a.first_name || '-'} | ${a.last_name || '-'} | ${a.email || '-'} |`);
  });

  process.exit(0);
}

exportVlaamseStemmen();
