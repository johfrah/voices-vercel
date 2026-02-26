import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSlugRegistry() {
  console.log('🔍 CHECKING SLUG REGISTRY\n');

  // 1. Check for artist/youssef
  console.log('📊 Step 1: Looking for "artist/youssef" in slug_registry...');
  const { data: artistYoussef, error: error1 } = await supabase
    .from('slug_registry')
    .select('*')
    .eq('slug', 'artist/youssef');

  if (error1) {
    console.error('❌ Error:', error1.message);
  } else if (!artistYoussef || artistYoussef.length === 0) {
    console.log('❌ No entry found for "artist/youssef"');
  } else {
    console.log('✅ Found entries:');
    artistYoussef.forEach(r => {
      console.log(`   - entity_id: ${r.entity_id}, entity_type_id: ${r.entity_type_id}, journey: ${r.journey}`);
    });
  }

  // 2. Check for just "youssef"
  console.log('\n📊 Step 2: Looking for "youssef" in slug_registry...');
  const { data: youssef, error: error2 } = await supabase
    .from('slug_registry')
    .select('*')
    .eq('slug', 'youssef');

  if (error2) {
    console.error('❌ Error:', error2.message);
  } else if (!youssef || youssef.length === 0) {
    console.log('❌ No entry found for "youssef"');
  } else {
    console.log('✅ Found entries:');
    youssef.forEach(r => {
      console.log(`   - entity_id: ${r.entity_id}, entity_type_id: ${r.entity_type_id}, journey: ${r.journey}`);
    });
  }

  // 3. Check all artist-related entries
  console.log('\n📊 Step 3: Looking for all artist entries (entity_type_id = 4)...');
  const { data: allArtists, error: error3 } = await supabase
    .from('slug_registry')
    .select('*')
    .eq('entity_type_id', 4);

  if (error3) {
    console.error('❌ Error:', error3.message);
  } else if (!allArtists || allArtists.length === 0) {
    console.log('❌ No artist entries found');
  } else {
    console.log(`✅ Found ${allArtists.length} artist entries:`);
    allArtists.forEach(r => {
      console.log(`   - slug: "${r.slug}", entity_id: ${r.entity_id}, journey: ${r.journey}, active: ${r.is_active}`);
    });
  }

  // 4. Check if we need to create the entry
  console.log('\n📊 Step 4: Recommendation');
  if (!artistYoussef || artistYoussef.length === 0) {
    console.log('⚠️  ISSUE: No slug_registry entry exists for "artist/youssef"');
    console.log('💡 SOLUTION: Create an entry in slug_registry:');
    console.log('   INSERT INTO slug_registry (slug, entity_id, entity_type_id, market_code, journey, is_active)');
    console.log('   VALUES (\'artist/youssef\', 1, 4, \'ALL\', \'artist\', true);');
  } else {
    console.log('✅ Slug registry entry exists');
  }
}

checkSlugRegistry().catch(console.error);
