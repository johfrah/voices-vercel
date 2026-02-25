
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Forensic Audit: Verifying Supabase Data Integrity after Migration...\n");

  // 1. Check Actors table for basic fields and manual lock
  console.log("--- 👤 Actors Table Integrity ---");
  const { data: actors, error: actorError } = await supabase
    .from('actors')
    .select('id, first_name, email, tagline, why_voices, is_manually_edited, logo_id')
    .in('id', [1718, 1719, 1770, 1768, 1760]) // Sample of our 118
    .order('id');

  if (actorError) console.error("❌ Error fetching actors:", actorError.message);
  else {
    actors.forEach(a => {
      const hasEmail = !!a.email;
      const hasTagline = !!a.tagline;
      const hasWhyVoices = !!a.why_voices;
      const isLocked = a.is_manually_edited;
      const hasLogo = !!a.logo_id;
      
      console.log(`[ID: ${a.id}] ${a.first_name.padEnd(10)} | Email: ${hasEmail ? '✅' : '❌'} | Tagline: ${hasTagline ? '✅' : '❌'} | WhyVoices: ${hasWhyVoices ? '✅' : '❌'} | Logo: ${hasLogo ? '✅' : '❌'} | Lock: ${isLocked ? '🔒' : '🔓'}`);
    });
  }

  // 2. Check Media table for Logos and Headers
  console.log("\n--- 🖼️ Media Table (Logos & Headers) ---");
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('category, count')
    .in('category', ['logo', 'header'])
    .filter('file_path', 'ilike', 'actor-assets/%'); // Our specific migration path

  // Note: Supabase doesn't support group by in JS client easily, so we fetch and count
  const { data: allMedia } = await supabase.from('media').select('category').ilike('file_path', 'actor-assets/%');
  if (allMedia) {
    const counts = allMedia.reduce((acc: any, m: any) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});
    console.log(`Total migrated Logos:   ${counts.logo || 0}`);
    console.log(`Total migrated Headers: ${counts.header || 0}`);
  }

  // 3. Check Actor Demos table
  console.log("\n--- 🎙️ Actor Demos (Audio Gallery) ---");
  const { data: demos, error: demoError } = await supabase
    .from('actor_demos')
    .select('id')
    .ilike('url', '%audio-gallery%');

  if (demoError) console.error("❌ Error fetching demos:", demoError.message);
  else {
    console.log(`Total migrated Demos:   ${demos.length}`);
  }

  // 4. Verify Storage Buckets (Quick check for a few files)
  console.log("\n--- 📦 Storage Bucket Verification (Samples) ---");
  const testPaths = [
    'actor-assets/1718/logo/Logo-16.png',
    'audio-gallery/1718/Demo-Voices-Kristien.mp3'
  ];

  for (const p of testPaths) {
    const { data, error } = await supabase.storage.from('voices').list(path.dirname(p), {
      search: path.basename(p)
    });
    if (data && data.length > 0) {
      console.log(`✅ File exists in Storage: ${p}`);
    } else {
      console.log(`❌ File MISSING in Storage: ${p}`);
    }
  }

  console.log("\n✅ Audit completed.");
}

import * as path from 'path';
main();
