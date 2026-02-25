
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
  console.log("🔍 Comparing Taglines: Supabase vs Master Dossier...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  const discrepancies = [];
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    const emailMatch = section.match(/- \*\*Email\*\*: `([^`]+)`/);
    if (!emailMatch) continue;
    const email = emailMatch[1].trim();

    const taglineMatch = section.match(/- \*\*Tagline\*\*: \*(.*)\*/);
    const dossierTagline = taglineMatch ? taglineMatch[1].trim() : null;

    if (!dossierTagline || dossierTagline === "Geen tagline gevonden") continue;

    // Fetch actor by email
    const { data: actor, error: fetchError } = await supabase
      .from('actors')
      .select('id, first_name, email, tagline')
      .eq('email', email)
      .single();

    if (fetchError || !actor) continue;

    const currentTagline = (actor.tagline || "").trim();
    const cleanDossierTagline = dossierTagline.trim();

    if (currentTagline !== cleanDossierTagline) {
      discrepancies.push({
        id: actor.id,
        name: actor.first_name,
        email: actor.email,
        supabase: currentTagline || "(LEEG)",
        dossier: cleanDossierTagline
      });
    }
  }

  if (discrepancies.length === 0) {
    console.log("✅ All taglines match perfectly!");
  } else {
    console.log(`⚠️ Found ${discrepancies.length} discrepancies:\n`);
    for (const d of discrepancies) {
      console.log(`--- [${d.id}] ${d.name} (${d.email}) ---`);
      console.log(`🔴 Supabase: ${d.supabase}`);
      console.log(`🟢 Dossier:  ${d.dossier}`);
      console.log("");
    }
  }
}

main();
