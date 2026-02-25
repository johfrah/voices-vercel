#!/usr/bin/env tsx

/**
 * 🛡️ CHRIS-PROTOCOL: Check Johfrah Actor Status
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJohfrah() {
  console.log('🔍 Checking Johfrah actor status...\n');

  // Check by slug
  const { data: bySlug, error: slugError } = await supabase
    .from('actors')
    .select('id, first_name, slug, status, is_public')
    .eq('slug', 'johfrah')
    .single();

  if (bySlug) {
    console.log('✅ Found by slug "johfrah":');
    console.log(JSON.stringify(bySlug, null, 2));
  } else {
    console.log('❌ Not found by slug "johfrah"');
    console.log('Error:', slugError?.message);
  }

  console.log('\n---\n');

  // Check by first_name
  const { data: byName, error: nameError } = await supabase
    .from('actors')
    .select('id, first_name, slug, status, is_public')
    .ilike('first_name', 'johfrah')
    .single();

  if (byName) {
    console.log('✅ Found by first_name "johfrah":');
    console.log(JSON.stringify(byName, null, 2));
  } else {
    console.log('❌ Not found by first_name "johfrah"');
    console.log('Error:', nameError?.message);
  }

  console.log('\n---\n');

  // Check recent system_events for johfrah
  const { data: events } = await supabase
    .from('system_events')
    .select('*')
    .ilike('message', '%johfrah%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (events && events.length > 0) {
    console.log('📋 Recent system_events mentioning "johfrah":');
    events.forEach(e => {
      console.log(`- [${e.level}] ${e.message}`);
      if (e.details) console.log(`  Details: ${JSON.stringify(e.details)}`);
    });
  } else {
    console.log('No recent system_events for johfrah');
  }
}

checkJohfrah().catch(console.error);
