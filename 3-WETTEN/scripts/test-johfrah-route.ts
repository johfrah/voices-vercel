#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testJohfrahRoute() {
  console.log('🔍 Testing Johfrah route resolution...\n');
  
  const slug = 'johfrah';
  const cleanSlug = slug.trim().toLowerCase();
  
  console.log(`1. Testing slug lookup: "${cleanSlug}"`);
  const { data: actor1, error: error1 } = await supabase
    .from('actors')
    .select('id, first_name, slug, status, is_public')
    .eq('slug', cleanSlug)
    .single();
  
  if (actor1) {
    console.log('✅ Found by slug:', actor1);
  } else {
    console.log('❌ Not found by slug:', error1?.message);
  }
  
  console.log(`\n2. Testing first_name lookup: "${cleanSlug}"`);
  const { data: actor2, error: error2 } = await supabase
    .from('actors')
    .select('id, first_name, slug, status, is_public')
    .ilike('first_name', cleanSlug)
    .limit(1)
    .single();
  
  if (actor2) {
    console.log('✅ Found by first_name:', actor2);
  } else {
    console.log('❌ Not found by first_name:', error2?.message);
  }
  
  console.log(`\n3. Testing ID lookup (1760):`);
  const { data: actor3, error: error3 } = await supabase
    .from('actors')
    .select('id, first_name, slug, status, is_public')
    .eq('id', 1760)
    .single();
  
  if (actor3) {
    console.log('✅ Found by ID:', actor3);
  } else {
    console.log('❌ Not found by ID:', error3?.message);
  }
  
  console.log(`\n4. Checking recent system_events for "johfrah" route errors:`);
  const { data: events } = await supabase
    .from('system_events')
    .select('*')
    .ilike('message', '%johfrah%')
    .ilike('message', '%smartrouter%')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (events && events.length > 0) {
    events.forEach((e: any) => {
      console.log(`- [${e.level}] ${e.message}`);
      if (e.details) {
        console.log(`  Details:`, JSON.stringify(e.details, null, 2).substring(0, 200));
      }
    });
  } else {
    console.log('No recent SmartRouter events found for johfrah');
  }
}

testJohfrahRoute().catch(console.error);
