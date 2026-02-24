
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
  console.log("🚀 Starting STRICT ID-BASED SYNC: Aligning Supabase with Master Dossier...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  let updatedCount = 0;
  let errorCount = 0;
  let skipCount = 0;
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    // Extract Actor ID from the header ## [ID] Name
    const idMatch = section.match(/^(\d+)\]/);
    if (!idMatch) continue;
    const actorId = parseInt(idMatch[1]);

    // Extract Email
    const emailMatch = section.match(/- \*\*Email\*\*: `([^`]+)`/);
    const email = emailMatch ? emailMatch[1].trim() : null;

    // Extract Tagline
    const taglineMatch = section.match(/- \*\*Tagline\*\*: \*(.*)\*/);
    const tagline = taglineMatch ? taglineMatch[1].trim() : null;

    // Extract Why Voices
    const whyVoicesMatch = section.match(/### 💡 Why Voices \(IVR\/Company\)\n([\s\S]*?)\n\n###/);
    const whyVoices = whyVoicesMatch ? whyVoicesMatch[1].trim() : null;

    // Extract Bio
    const bioMatch = section.match(/### 📖 Bio\n([\s\S]*?)\n\n---/);
    const bio = bioMatch ? bioMatch[1].trim() : null;

    // Skip if placeholders
    const cleanTagline = tagline === "Geen tagline gevonden" ? null : tagline;
    const cleanWhyVoices = whyVoices === "_Geen Why Voices tekst_" ? null : whyVoices;
    const cleanBio = bio === "_Geen bio gevonden_" ? null : bio;

    console.log(`Checking Actor [${actorId}]...`);

    // Fetch current state to see if we actually need to update
    const { data: actor, error: fetchError } = await supabase
      .from('actors')
      .select('id, email, tagline, why_voices, bio')
      .eq('id', actorId)
      .single();

    if (fetchError || !actor) {
      console.log(`   ⚠️ Actor [${actorId}] not found in Supabase. Skipping.`);
      skipCount++;
      continue;
    }

    const updates: any = {};
    if (email && actor.email !== email) updates.email = email;
    if (cleanTagline && actor.tagline !== cleanTagline) updates.tagline = cleanTagline;
    if (cleanWhyVoices && actor.why_voices !== cleanWhyVoices) updates.why_voices = cleanWhyVoices;
    if (cleanBio && actor.bio !== cleanBio) updates.bio = cleanBio;

    if (Object.keys(updates).length > 0) {
      console.log(`   ✨ Updating: ${Object.keys(updates).join(', ')}`);
      
      const { error: updateError } = await supabase
        .from('actors')
        .update({ 
          ...updates,
          is_manually_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', actorId);

      if (updateError) {
        console.error(`   ❌ Error updating Actor [${actorId}]:`, updateError.message);
        errorCount++;
      } else {
        updatedCount++;
      }
    } else {
      console.log(`   💤 Already perfectly aligned.`);
    }
  }

  console.log(`\n✅ Strict Sync Completed!`);
  console.log(`   - Updated: ${updatedCount}`);
  console.log(`   - Skipped (Not found): ${skipCount}`);
  console.log(`   - Errors: ${errorCount}`);
}

main();
