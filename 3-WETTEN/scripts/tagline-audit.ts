
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Tagline Audit: Hoeveel taglines ontbreken er in Supabase?");

  const { data: actors, error } = await supabase
    .from('actors')
    .select('id, first_name, last_name, tagline, status')
    .eq('status', 'live');

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  const emptyTaglines = actors.filter(a => !a.tagline || a.tagline.trim() === "");
  
  console.log(`\n--- RESULTAAT ---`);
  console.log(`Totaal aantal live actors: ${actors.length}`);
  console.log(`Aantal actors met lege tagline: ${emptyTaglines.length}`);
  
  if (emptyTaglines.length > 0) {
    console.log("\nVoorbeelden van actors zonder tagline:");
    emptyTaglines.slice(0, 10).forEach(a => {
      console.log(`- ${a.first_name} ${a.last_name || ''} (ID: ${a.id})`);
    });
  }
}

main();
