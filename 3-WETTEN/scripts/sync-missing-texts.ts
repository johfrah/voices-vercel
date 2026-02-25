
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
  console.log("🚀 Starting Masterclass Sync (V2): Healing missing texts using Email matching...");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    const emailMatch = section.match(/- \*\*Email\*\*: `([^`]+)`/);
    if (!emailMatch) continue;
    const email = emailMatch[1].trim();

    const taglineMatch = section.match(/- \*\*Tagline\*\*: \*(.*)\*/);
    const whyVoicesMatch = section.match(/### 💡 Why Voices \(IVR\/Company\)\n([\s\S]*?)\n\n###/);
    const bioMatch = section.match(/### 📖 Bio\n([\s\S]*?)\n\n---/);

    const tagline = taglineMatch ? taglineMatch[1].trim() : null;
    let whyVoices = whyVoicesMatch ? whyVoicesMatch[1].trim() : null;
    let bio = bioMatch ? bioMatch[1].trim() : null;

    // Clean up placeholders
    const hasTagline = tagline && tagline !== "Geen tagline gevonden";
    const hasWhyVoices = whyVoices && whyVoices !== "_Geen Why Voices tekst_";
    const hasBio = bio && bio !== "_Geen bio gevonden_";

    if (!hasTagline && !hasWhyVoices && !hasBio) continue;

    console.log(`\n🔍 Checking Actor with email [${email}]...`);

    // Fetch actor by email
    const { data: actor, error: fetchError } = await supabase
      .from('actors')
      .select('id, email, tagline, why_voices, bio')
      .eq('email', email)
      .single();

    if (fetchError || !actor) {
      console.log(`⚠️ Actor with email [${email}] not found in Supabase.`);
      continue;
    }

    const updates: any = {};
    
    // 1. Tagline herstellen indien leeg
    if (!actor.tagline && hasTagline) {
      updates.tagline = tagline;
      console.log(`   ✅ Adding missing tagline: ${tagline.substring(0, 50)}...`);
    }

    // 2. Why Voices herstellen indien leeg
    if (!actor.why_voices && hasWhyVoices) {
      updates.why_voices = whyVoices;
      console.log(`   ✅ Adding missing Why Voices: ${whyVoices.substring(0, 50)}...`);
    }

    // 3. Bio herstellen indien leeg OF als er escape chars in zitten
    const hasEscapeChars = actor.bio && (actor.bio.includes("\\'") || actor.bio.includes("\\r\\n"));
    if ((!actor.bio || hasEscapeChars) && hasBio) {
      updates.bio = bio;
      console.log(`   ✅ ${hasEscapeChars ? 'Cleaning' : 'Adding'} bio.`);
    }

    if (Object.keys(updates).length > 0) {
      updates.is_manually_edited = true;
      updates.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('actors')
        .update(updates)
        .eq('id', actor.id);

      if (updateError) {
        console.error(`   ❌ Error updating Actor [${actor.id}]:`, updateError.message);
      } else {
        console.log(`   ✨ Actor [${actor.id}] healed successfully.`);
      }
    } else {
      console.log(`   💤 No updates needed for Actor [${actor.id}].`);
    }
  }

  console.log("\n✅ Masterclass Sync completed.");
}

main();
