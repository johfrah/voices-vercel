/**
 * 💀 NUCLEAR OPERATION: FINAL SLOP PURGE (2026)
 * 
 * Doel: Verwijdert de laatst gevonden slop-entries en voorkomt nieuwe injecties.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalSlopPurge() {
  console.log('🚀 Start finale slop-purge...');

  const idsToRemove = [37358, 35945, 35950, 36510, 36804];

  const { count, error } = await supabase
    .from('translations')
    .delete({ count: 'exact' })
    .in('id', idsToRemove);

  if (error) {
    console.error('❌ Fout bij verwijderen slop:', error.message);
  } else {
    console.log(`✅ ${count} slop-entries definitief verwijderd.`);
  }

  // Ook de 'Basistarief (Video)' uit de screenshot herstellen naar 'Basistarief (Voice-over)'
  // We zoeken op de key die waarschijnlijk 'pricing.base_video' of iets dergelijks is
  const { data: pricingEntries } = await supabase
    .from('translations')
    .select('id, translation_key, translated_text')
    .ilike('translated_text', '%Basistarief (Video)%')
    .eq('lang', 'nl-be');

  if (pricingEntries && pricingEntries.length > 0) {
    for (const entry of pricingEntries) {
      await supabase.from('translations').delete().eq('id', entry.id);
      console.log(`✅ Slop hersteld voor key: ${entry.translation_key} ("${entry.translated_text}")`);
    }
  }

  console.log('✨ Purge voltooid.');
}

finalSlopPurge();
