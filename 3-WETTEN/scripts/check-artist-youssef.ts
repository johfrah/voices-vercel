#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkArtist() {
  console.log('🔍 CHECKING ARTIST TABLE FOR YOUSSEF\n');

  // Check by ID
  const { data: byId, error: errorId } = await supabase
    .from('artists')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  console.log('📊 Query by ID = 1:');
  if (errorId) {
    console.error('❌ Error:', errorId);
  } else if (byId) {
    console.log('✅ Found:', JSON.stringify(byId, null, 2));
  } else {
    console.log('❌ Not found');
  }

  // Check by slug = 'youssef'
  const { data: bySlug, error: errorSlug } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', 'youssef')
    .maybeSingle();

  console.log('\n📊 Query by slug = "youssef":');
  if (errorSlug) {
    console.error('❌ Error:', errorSlug);
  } else if (bySlug) {
    console.log('✅ Found:', JSON.stringify(bySlug, null, 2));
  } else {
    console.log('❌ Not found');
  }

  // Check by slug = '1'
  const { data: bySlug1, error: errorSlug1 } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', '1')
    .maybeSingle();

  console.log('\n📊 Query by slug = "1":');
  if (errorSlug1) {
    console.error('❌ Error:', errorSlug1);
  } else if (bySlug1) {
    console.log('✅ Found:', JSON.stringify(bySlug1, null, 2));
  } else {
    console.log('❌ Not found (this is the problem!)');
  }
}

checkArtist().catch(console.error);
