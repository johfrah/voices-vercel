import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 🏗️ Load environment variables from the correct location
dotenv.config({ path: path.join(process.cwd(), '../../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 🛠️ AUTO-HEAL: LANGUAGE RELATION MIGRATOR (2026)
 */
async function autoHealLanguages() {
  console.log('🚀 Starting Auto-Heal: Language Relations (via Supabase SDK)...');

  try {
    // 1. Haal alle talen op
    const { data: dbLangs, error: langError } = await supabase.from('languages').select('*');
    if (langError) throw langError;
    console.log(`📚 Found ${dbLangs?.length} languages in taxonomy.`);

    // 2. Haal alle live actors op
    const { data: allActors, error: actorError } = await supabase
      .from('actors')
      .select('*')
      .eq('status', 'live');
    
    if (actorError) throw actorError;
    console.log(`🎙️ Processing ${allActors?.length} live actors...`);

    let healedCount = 0;
    let skippedCount = 0;

    for (const actor of allActors || []) {
      const nativeText = actor.native_lang?.toLowerCase() || '';
      if (!nativeText) {
        skippedCount++;
        continue;
      }

      let targetCode = '';
      if (nativeText.includes('vlaams') || nativeText.includes('be')) targetCode = 'nl-be';
      else if (nativeText.includes('nederlands') || nativeText.includes('nl')) targetCode = 'nl-nl';
      else if (nativeText.includes('frans') || nativeText.includes('fr')) targetCode = 'fr-fr';
      else if (nativeText.includes('engels') || nativeText.includes('en')) targetCode = 'en-gb';
      else if (nativeText.includes('duits') || nativeText.includes('de')) targetCode = 'de-de';
      else if (nativeText.includes('spaans') || nativeText.includes('es')) targetCode = 'es-es';
      else if (nativeText.includes('italiaans') || nativeText.includes('it')) targetCode = 'it-it';
      
      const targetLang = dbLangs?.find(l => l.code === targetCode || l.label.toLowerCase() === nativeText);

      if (targetLang) {
        // Check of relatie bestaat
        const { data: existing } = await supabase
          .from('actor_languages')
          .select('*')
          .eq('actor_id', actor.id)
          .eq('language_id', targetLang.id);

        if (!existing || existing.length === 0) {
          // Voeg relatie toe
          await supabase.from('actor_languages').insert({
            actor_id: actor.id,
            language_id: targetLang.id,
            is_native: true
          });
          
          // Update native_lang naar code
          await supabase.from('actors')
            .update({ native_lang: targetLang.code })
            .eq('id', actor.id);

          console.log(`✅ Healed: ${actor.first_name} -> ${targetLang.label} (${targetLang.code})`);
          healedCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✨ Auto-Heal Completed! healed: ${healedCount}, skipped: ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Auto-Heal Failed:', error);
    process.exit(1);
  }
}

autoHealLanguages();
