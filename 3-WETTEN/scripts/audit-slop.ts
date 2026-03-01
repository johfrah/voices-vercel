/**
 * 💀 NUCLEAR OPERATION: SLOP AUDIT (2026)
 * 
 * Doel: Zoekt naar specifieke slop-termen in de database.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSlop() {
  console.log('🚀 Start slop-audit...');

  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .or('translated_text.ilike.%Onze stemmen%,translated_text.ilike.%Zo gaan we te werk%')
    .eq('lang', 'nl-be');

  if (error) {
    console.error('❌ Fout bij audit:', error.message);
  } else {
    console.log(`🔍 Gevonden resultaten (${data?.length || 0}):`);
    console.log(JSON.stringify(data, null, 2));
  }
}

auditSlop();
