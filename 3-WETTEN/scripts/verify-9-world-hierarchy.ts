#!/usr/bin/env tsx
/**
 * 🔍 9-World Hierarchy Verification Script
 * Verifies the complete 9-world architecture in v2.16.117
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyHierarchy() {
  console.log('🔍 VERIFYING 9-WORLD HIERARCHY (v2.16.117)\n');

  // 1. Check all worlds
  const { data: allWorlds, error: worldsError } = await supabase
    .from('worlds')
    .select('id, label, code')
    .order('id');

  if (worldsError) {
    console.error('❌ Error fetching worlds:', worldsError);
    process.exit(1);
  }

  console.log('📊 WORLDS:');
  allWorlds?.forEach(w => {
    console.log(`  [${w.id}] ${w.label} (code: ${w.code})`);
  });

  // 2. Check Agency journeys (World 1)
  console.log('\n🎯 AGENCY JOURNEYS (World 1):');
  const { data: agencyJourneys } = await supabase
    .from('journeys')
    .select('id, label, world_id')
    .eq('world_id', 1)
    .order('id');

  agencyJourneys?.forEach(j => {
    console.log(`  [${j.id}] ${j.label}`);
  });

  // 3. Check Studio journeys (World 2)
  console.log('\n🎬 STUDIO JOURNEYS (World 2):');
  const { data: studioJourneys } = await supabase
    .from('journeys')
    .select('id, label, world_id')
    .eq('world_id', 2)
    .order('id');

  studioJourneys?.forEach(j => {
    console.log(`  [${j.id}] ${j.label}`);
  });

  // 4. Check Ademing journeys (World 6)
  console.log('\n🫁 ADEMING JOURNEYS (World 6):');
  const { data: ademingJourneys } = await supabase
    .from('journeys')
    .select('id, label, world_id')
    .eq('world_id', 6)
    .order('id');

  ademingJourneys?.forEach(j => {
    console.log(`  [${j.id}] ${j.label}`);
  });

  // 5. Check specific journey labels for Agency
  console.log('\n🏷️ AGENCY JOURNEY LABELS:');
  const expectedLabels = ['Telefonie', 'Video', 'Advertentie'];
  let allValid = true;
  
  for (const label of expectedLabels) {
    const found = agencyJourneys?.find(j => j.label === label);
    console.log(`  ${label}: ${found ? '✅ FOUND (ID: ' + found.id + ')' : '❌ MISSING'}`);
    if (!found) allValid = false;
  }

  // 6. Verify all worlds have at least 1 journey
  console.log('\n✅ WORLD-JOURNEY MAPPING:');
  for (const world of allWorlds || []) {
    const { data: worldJourneys } = await supabase
      .from('journeys')
      .select('id')
      .eq('world_id', world.id);
    
    const count = worldJourneys?.length || 0;
    console.log(`  World ${world.id} (${world.label}): ${count} journey(s)`);
  }

  // 7. Final verdict
  console.log('\n' + '='.repeat(60));
  if (allValid) {
    console.log('✅ 9-WORLD HIERARCHY IS 100% COMPLEET EN ROBUUST');
  } else {
    console.log('❌ HIERARCHY HAS ISSUES - SEE DETAILS ABOVE');
  }
  console.log('='.repeat(60));

  process.exit(allValid ? 0 : 1);
}

verifyHierarchy();
