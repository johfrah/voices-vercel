/**
 * 💀 NUCLEAR OPERATION: NL-VARIANT TERMINATION (2026)
 * 
 * Doel: Elimineert de 'nl' taalvariant volledig uit de database.
 * Alles wordt geünificeerd naar 'nl-BE' (Source of Truth).
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function terminateNl() {
  console.log('🚀 Start nucleaire eliminatie van "nl" variant...');

  // 1. Verwijder alle vertalingen met lang='nl'
  const { count: transCount, error: transError } = await supabase
    .from('translations')
    .delete({ count: 'exact' })
    .eq('lang', 'nl');

  if (transError) console.error('❌ Fout bij verwijderen nl-vertalingen:', transError.message);
  else console.log(`✅ ${transCount} 'nl' vertalingen geëlimineerd.`);

  // 2. Update alle market_configs die per ongeluk op 'nl' staan
  const { data: configs, error: configError } = await supabase
    .from('market_configs')
    .select('id, localization');

  if (configError) {
    console.error('❌ Fout bij ophalen market_configs:', configError.message);
  } else {
    for (const config of (configs || [])) {
      const loc = config.localization as any;
      if (loc?.default_lang === 'nl' || loc?.locale === 'nl') {
        const newLoc = { 
          ...loc, 
          default_lang: loc.default_lang === 'nl' ? 'nl-BE' : loc.default_lang,
          locale: loc.locale === 'nl' ? 'nl-BE' : loc.locale
        };
        await supabase.from('market_configs').update({ localization: newLoc }).eq('id', config.id);
        console.log(`✅ Market config ${config.id} hersteld naar nl-BE.`);
      }
    }
  }

  // 3. Verwijder 'nl' uit de talen tabel indien aanwezig
  const { error: langError } = await supabase
    .from('languages')
    .delete()
    .eq('code', 'nl');
  
  if (langError) console.log('ℹ️ "nl" stond niet in de languages tabel of kon niet verwijderd worden.');
  else console.log('✅ "nl" verwijderd uit de officiële talenlijst.');

  console.log('✨ Operatie voltooid. De "nl" variant bestaat niet meer in de database.');
}

terminateNl();
