
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
  console.log("🔍 Forensic Audit: Checking for Email and Text Inconsistencies...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  const issues = [];
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    const emailMatch = section.match(/- \*\*Email\*\*: `([^`]+)`/);
    if (!emailMatch) continue;
    const dossierEmail = emailMatch[1].trim().toLowerCase();

    const taglineMatch = section.match(/- \*\*Tagline\*\*: \*(.*)\*/);
    const whyVoicesMatch = section.match(/### 💡 Why Voices \(IVR\/Company\)\n([\s\S]*?)\n\n###/);
    const bioMatch = section.match(/### 📖 Bio\n([\s\S]*?)\n\n---/);

    const dossierTagline = taglineMatch ? taglineMatch[1].trim() : null;
    let dossierWhyVoices = whyVoicesMatch ? whyVoicesMatch[1].trim() : null;
    let dossierBio = bioMatch ? bioMatch[1].trim() : null;

    // Clean up placeholders
    if (dossierTagline === "Geen tagline gevonden") continue;
    if (dossierWhyVoices === "_Geen Why Voices tekst_") dossierWhyVoices = null;
    if (dossierBio === "_Geen bio gevonden_") dossierBio = null;

    // We zoeken de acteur op basis van de naam (eerste regel van sectie) om te zien of het emailadres klopt
    const nameLine = section.split('\n')[0];
    const name = nameLine.replace(/\d+\] /, '').trim();

    // Zoek acteur op naam
    const { data: actors, error: fetchError } = await supabase
      .from('actors')
      .select('id, first_name, email, tagline, why_voices, bio, is_manually_edited')
      .ilike('first_name', name);

    if (fetchError || !actors || actors.length === 0) {
      // Alleen loggen als we de acteur echt niet kunnen vinden
      continue;
    }

    for (const actor of actors) {
      const currentEmail = (actor.email || "").trim().toLowerCase();
      const currentTagline = (actor.tagline || "").trim();
      const currentWhyVoices = (actor.why_voices || "").trim();
      const currentBio = (actor.bio || "").trim();

      const emailMismatch = currentEmail !== dossierEmail;
      const taglineMismatch = dossierTagline && currentTagline !== dossierTagline.trim();
      const whyVoicesMismatch = dossierWhyVoices && currentWhyVoices !== dossierWhyVoices.trim();
      const bioMismatch = dossierBio && currentBio !== dossierBio.trim() && !currentBio.includes(dossierBio.substring(0, 50));

      if (emailMismatch || taglineMismatch || whyVoicesMismatch || bioMismatch) {
        issues.push({
          id: actor.id,
          name: name,
          emailMismatch,
          taglineMismatch,
          whyVoicesMismatch,
          bioMismatch,
          currentEmail,
          dossierEmail,
          currentTagline: currentTagline.substring(0, 30) + "...",
          dossierTagline: (dossierTagline || "").substring(0, 30) + "...",
          isManuallyEdited: actor.is_manually_edited
        });
      }
    }
  }

  if (issues.length === 0) {
    console.log("✅ All actors in Supabase are perfectly aligned with the Master Dossier!");
  } else {
    console.log(`⚠️ Found ${issues.length} potential inconsistencies:\n`);
    for (const issue of issues) {
      console.log(`--- [${issue.id}] ${issue.name} ---`);
      if (issue.emailMismatch) {
        console.log(`   🔴 Email Mismatch! Supabase: '${issue.currentEmail}' vs Dossier: '${issue.dossierEmail}'`);
      }
      if (issue.taglineMismatch) {
        console.log(`   🟠 Tagline Mismatch!`);
      }
      if (issue.whyVoicesMismatch) {
        console.log(`   🟡 Why Voices Mismatch!`);
      }
      if (issue.bioMismatch) {
        console.log(`   🔵 Bio Mismatch!`);
      }
      console.log("");
    }
  }
}

main();
