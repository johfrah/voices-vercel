import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixYoussefRouting() {
  console.log('🔧 FIXING YOUSSEF ROUTING\n');

  // 1. First, check if the entry already exists
  const { data: existing } = await supabase
    .from('slug_registry')
    .select('*')
    .eq('slug', 'artist/youssef')
    .maybeSingle();

  if (existing) {
    console.log('✅ Entry already exists for "artist/youssef"');
    console.log(`   - entity_id: ${existing.entity_id}`);
    console.log(`   - entity_type_id: ${existing.entity_type_id}`);
    console.log(`   - journey: ${existing.journey}`);
    console.log(`   - is_active: ${existing.is_active}`);
    return;
  }

  // 2. Create the entry
  console.log('📝 Creating slug_registry entry for "artist/youssef"...');
  const { data: newEntry, error } = await supabase
    .from('slug_registry')
    .insert({
      slug: 'artist/youssef',
      routing_type: 'artist',
      entity_id: 1, // Youssef's artist ID
      entity_type_id: 4, // artist type
      market_code: 'ALL',
      journey: 'artist',
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating entry:', error);
    return;
  }

  console.log('✅ Successfully created slug_registry entry:');
  console.log(`   - slug: ${newEntry.slug}`);
  console.log(`   - entity_id: ${newEntry.entity_id}`);
  console.log(`   - entity_type_id: ${newEntry.entity_type_id}`);
  console.log(`   - journey: ${newEntry.journey}`);
  console.log(`   - market_code: ${newEntry.market_code}`);
  console.log(`   - is_active: ${newEntry.is_active}`);

  console.log('\n🎉 ROUTING FIX COMPLETE!');
  console.log('   The URL https://www.voices.be/artist/youssef should now work correctly.');
}

fixYoussefRouting().catch(console.error);
