import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFrenchActors() {
  console.log('🔍 Checking French actors in database...\n');

  // Get French language ID
  const { data: frenchLang } = await supabase
    .from('languages')
    .select('id, label, code')
    .ilike('label', '%frans%')
    .single();

  console.log('French language:', frenchLang);

  // Get all French actors
  const { data: frenchActors, count: totalFrench } = await supabase
    .from('actors')
    .select('id, display_name, native_lang_label, native_lang_id, gender_id, status, is_public', { count: 'exact' })
    .eq('status', 'live')
    .eq('is_public', true)
    .eq('native_lang_id', frenchLang?.id)
    .order('display_name');

  console.log(`\n✅ Total French actors: ${totalFrench}`);
  console.log('First 10 French actors:');
  frenchActors?.slice(0, 10).forEach(a => {
    console.log(`  - ${a.display_name} (gender_id: ${a.gender_id})`);
  });

  // Get gender for "Vrouw"
  const { data: femaleGender } = await supabase
    .from('genders')
    .select('id, label')
    .eq('label', 'Vrouw')
    .single();

  console.log(`\n👩 Female gender:`, femaleGender);

  // Get French female actors
  const { data: frenchFemale, count: totalFrenchFemale } = await supabase
    .from('actors')
    .select('id, display_name, native_lang_label, gender_id', { count: 'exact' })
    .eq('status', 'live')
    .eq('is_public', true)
    .eq('native_lang_id', frenchLang?.id)
    .eq('gender_id', femaleGender?.id)
    .order('display_name');

  console.log(`\n✅ Total French female actors: ${totalFrenchFemale}`);
  console.log('French female actors:');
  frenchFemale?.forEach(a => {
    console.log(`  - ${a.display_name}`);
  });

  // Check all genders
  const { data: allGenders } = await supabase
    .from('genders')
    .select('*')
    .order('id');

  console.log('\n📊 All genders in database:');
  allGenders?.forEach(g => {
    console.log(`  - ${g.label} (id: ${g.id})`);
  });
}

checkFrenchActors().catch(console.error);
