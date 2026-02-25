import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the web app
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateExtraLangs() {
  console.log('🚀 [EXTRA-LANGS-MIGRATION] Starting migration of extra_langs slop...');

  // 1. Fetch all actors with extra_langs data
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, extra_langs')
    .not('extra_langs', 'is', null)
    .neq('extra_langs', 'NULL')
    .neq('extra_langs', '');

  if (actorsError) {
    console.error('❌ Error fetching actors:', actorsError);
    return;
  }

  console.log(`🔍 Found ${actors.length} actors with extra_langs data.`);

  // 2. Fetch all languages for mapping
  const { data: languages } = await supabase.from('languages').select('id, code, label');
  const langMap = new Map();
  languages?.forEach(l => {
    langMap.set(l.code.toLowerCase(), l.id);
    langMap.set(l.label.toLowerCase(), l.id);
  });

  // 3. Process each actor
  for (const actor of actors) {
    const extraLangsStr = actor.extra_langs;
    if (!extraLangsStr) continue;

    // Split by comma, semicolon or space and clean up
    const langNames = extraLangsStr.split(/[;,]+/).map((s: string) => s.trim()).filter(Boolean);
    
    console.log(`📦 Actor ${actor.id}: Processing extra langs: ${langNames.join(', ')}`);

    for (const name of langNames) {
      const langId = langMap.get(name.toLowerCase());
      if (langId) {
        // Check if mapping already exists to avoid duplicates
        const { data: existing } = await supabase
          .from('actor_languages')
          .select('id')
          .eq('actor_id', actor.id)
          .eq('language_id', langId)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabase
            .from('actor_languages')
            .insert({
              actor_id: actor.id,
              language_id: langId,
              is_native: false
            });

          if (insertError) {
            console.error(`❌ Error inserting lang ${langId} for actor ${actor.id}:`, insertError.message);
          } else {
            console.log(`✅ Linked actor ${actor.id} to extra language: ${name} (ID: ${langId})`);
          }
        } else {
          console.log(`ℹ️ Actor ${actor.id} already linked to extra language: ${name} (ID: ${langId})`);
        }
      } else {
        console.warn(`⚠️ Could not find ID for language: "${name}" (Actor ${actor.id})`);
      }
    }
  }

  console.log('\n🏁 [EXTRA-LANGS-MIGRATION COMPLETE]');
}

migrateExtraLangs().catch(console.error);
