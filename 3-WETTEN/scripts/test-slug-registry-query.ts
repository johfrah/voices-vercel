#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testQuery() {
  console.log('🔍 TESTING SLUG REGISTRY QUERY\n');

  const slug = 'artist/youssef';
  const marketCode = 'BE';

  console.log(`Testing query for slug: "${slug}", marketCode: "${marketCode}"\n`);

  // Test the exact query from the code
  const { data: entry, error } = await supabase
    .from('slug_registry')
    .select('entity_id, journey, canonical_slug, metadata, entity_type_id, language_id, entity_types(code)')
    .eq('slug', slug.toLowerCase())
    .or(`market_code.eq.${marketCode},market_code.eq.ALL`)
    .eq('is_active', true)
    .order('entity_type_id', { ascending: false })
    .limit(1)
    .single();

  console.log('📊 Query Result:');
  if (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2));
  } else if (entry) {
    console.log('✅ Entry found:', JSON.stringify(entry, null, 2));
    console.log('\n📌 Extracted values:');
    console.log(`   - entity_id: ${entry.entity_id}`);
    console.log(`   - entity_type_id: ${entry.entity_type_id}`);
    console.log(`   - journey: ${entry.journey}`);
    console.log(`   - routing_type (from entity_types.code): ${(entry.entity_types as any)?.code || 'NOT FOUND'}`);
  } else {
    console.log('❌ No entry found');
  }

  // Also check if entity_types table exists and has the right data
  console.log('\n📊 Checking entity_types table:');
  const { data: entityTypes, error: etError } = await supabase
    .from('entity_types')
    .select('*')
    .eq('id', 4);

  if (etError) {
    console.error('❌ Error:', JSON.stringify(etError, null, 2));
  } else if (entityTypes) {
    console.log('✅ Entity type 4:', JSON.stringify(entityTypes, null, 2));
  }
}

testQuery().catch(console.error);
