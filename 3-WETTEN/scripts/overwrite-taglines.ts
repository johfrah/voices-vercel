
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const mdPath = '4-KELDER/VOICE-ACTORS-MATCHING.md';

async function main() {
  console.log("🚀 Starting Masterclass Tagline Overwrite: Aligning with Master Dossier...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  let updatedCount = 0;
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    const emailMatch = section.match(/- \*\*Email\*\*: `([^`]+)`/);
    if (!emailMatch) continue;
    const email = emailMatch[1].trim();

    const taglineMatch = section.match(/- \*\*Tagline\*\*: \*(.*)\*/);
    const dossierTagline = taglineMatch ? taglineMatch[1].trim() : null;

    if (!dossierTagline || dossierTagline === "Geen tagline gevonden") continue;

    // Fetch actor by email to get ID
    const { data: actor, error: fetchError } = await supabase
      .from('actors')
      .select('id, first_name, email, tagline')
      .eq('email', email)
      .single();

    if (fetchError || !actor) continue;

    const currentTagline = (actor.tagline || "").trim();
    const cleanDossierTagline = dossierTagline.trim();

    // We overschrijven als het verschilt (inclusief NULL waarden)
    if (currentTagline !== cleanDossierTagline) {
      console.log(`Updating [${actor.id}] ${actor.first_name}...`);
      
      const { error: updateError } = await supabase
        .from('actors')
        .update({ 
          tagline: cleanDossierTagline,
          is_manually_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', actor.id);

      if (updateError) {
        console.error(`   ❌ Error updating Actor [${actor.id}]:`, updateError.message);
      } else {
        console.log(`   ✨ Tagline updated successfully.`);
        updatedCount++;
      }
    }
  }

  console.log(`\n✅ Masterclass Tagline Overwrite completed. ${updatedCount} taglines aligned.`);
}

main();
