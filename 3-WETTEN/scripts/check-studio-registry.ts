
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudio() {
  console.log('🔍 Checking slug_registry for "studio"...');
  const { data, error } = await supabase
    .from('slug_registry')
    .select('*')
    .ilike('slug', 'studio%');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} entries:`);
    data.forEach(entry => {
      console.log(`   - ID: ${entry.id}, Slug: "${entry.slug}", EntityID: ${entry.entity_id}, TypeID: ${entry.entity_type_id}, Journey: ${entry.journey}`);
    });
  } else {
    console.log('❌ No studio entries found in slug_registry.');
  }
}

checkStudio();
