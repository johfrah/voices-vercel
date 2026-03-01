/**
 * 💀 NUCLEAR OPERATION: JOURNEY SLOP CLEANUP (2026)
 * 
 * Doel: Verwijdert foutieve journey-vertalingen die niet de Source Truth zijn.
 * Herstelt 'Stemacteur' naar 'Voice-over' en 'Reclamespot' naar 'Commercial'.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupJourneySlop() {
  console.log('🚀 Start opschonen van journey-slop...');

  const keysToReset = [
    'journey.telephony',
    'journey.video',
    'journey.commercial',
    'journey.telephony.sub',
    'journey.video.sub',
    'journey.commercial.sub'
  ];

  // Verwijder deze keys voor nl-be zodat ze terugvallen op de code (Default is Truth)
  const { count, error } = await supabase
    .from('translations')
    .delete({ count: 'exact' })
    .in('translation_key', keysToReset)
    .eq('lang', 'nl-be');

  if (error) console.error('❌ Fout bij verwijderen journey-slop:', error.message);
  else console.log(`✅ ${count} journey-gerelateerde slop-entries verwijderd.`);

  // Update ook de journeys tabel labels voor de zekerheid
  await supabase.from('journeys').update({ label: 'Telefoon' }).eq('code', 'telephony');
  await supabase.from('journeys').update({ label: 'Voice-over' }).eq('code', 'video');
  await supabase.from('journeys').update({ label: 'Commercial' }).eq('code', 'commercial');
  console.log('✅ Journeys tabel labels hersteld naar Source Truth.');

  console.log('✨ Operatie voltooid.');
}

cleanupJourneySlop();
