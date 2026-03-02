#!/usr/bin/env tsx
/**
 * 🔍 Check Workshop Slugs in Database
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWorkshopSlugs() {
  console.log('\n🔍 CHECKING WORKSHOP SLUGS IN DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const slugsToCheck = [
    'perfect-spreken',
    'perfect-spreken-in-1-dag',
    'audioboeken-inspreken',
    'studio-audioboeken-inspreken'
  ];

  for (const slug of slugsToCheck) {
    console.log(`\n📍 Checking slug: "${slug}"`);
    console.log('─────────────────────────────────────────────────────────────');

    // Check slug_registry
    const { data: registryData, error: registryError } = await supabase
      .from('slug_registry')
      .select('*')
      .eq('slug', slug)
      .eq('market_code', 'nl-BE')
      .single();

    if (registryError) {
      console.log(`   ❌ Not found in slug_registry: ${registryError.message}`);
    } else {
      console.log(`   ✅ Found in slug_registry:`);
      console.log(`      - entity_id: ${registryData.entity_id}`);
      console.log(`      - routing_type: ${registryData.routing_type}`);
      console.log(`      - world_id: ${registryData.world_id}`);
      console.log(`      - is_active: ${registryData.is_active}`);
    }

    // Check workshops table
    const { data: workshopData, error: workshopError } = await supabase
      .from('workshops')
      .select('id, title, slug, status, is_public')
      .eq('slug', slug)
      .single();

    if (workshopError) {
      console.log(`   ❌ Not found in workshops table: ${workshopError.message}`);
    } else {
      console.log(`   ✅ Found in workshops table:`);
      console.log(`      - id: ${workshopData.id}`);
      console.log(`      - title: ${workshopData.title}`);
      console.log(`      - status: ${workshopData.status}`);
      console.log(`      - is_public: ${workshopData.is_public}`);
    }
  }

  // Get all workshop slugs
  console.log('\n\n📋 ALL WORKSHOP SLUGS IN DATABASE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const { data: allWorkshops, error: allError } = await supabase
    .from('workshops')
    .select('id, title, slug, status, is_public')
    .eq('is_public', true)
    .eq('status', 'live')
    .order('title');

  if (allError) {
    console.log(`❌ Error: ${allError.message}`);
  } else {
    console.log(`\nFound ${allWorkshops?.length || 0} live public workshops:\n`);
    allWorkshops?.forEach((w, i) => {
      console.log(`${i + 1}. "${w.title}" → /studio/${w.slug}`);
    });
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkWorkshopSlugs();
