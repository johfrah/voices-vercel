
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
  console.log(`🔍 Diepe inspectie van alle tekstvelden voor Kristien (ID: ${actorId})...`);

  const { data: actor, error } = await supabase
    .from('actors')
    .select('id, first_name, tagline, bio, why_voices, tone_of_voice, extra_langs')
    .eq('id', actorId)
    .single();

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log("\n--- HUIDIGE STAAT IN SUPABASE ---");
  console.log(`Naam: ${actor.first_name}`);
  console.log(`Tagline: ${JSON.stringify(actor.tagline)}`);
  console.log(`Bio: ${actor.bio?.substring(0, 50)}...`);
  console.log(`Why Voices: ${JSON.stringify(actor.why_voices)}`);
  console.log(`Tone of Voice: ${JSON.stringify(actor.tone_of_voice)}`);
  console.log(`Extra Talen: ${JSON.stringify(actor.extra_langs)}`);
}

main();
