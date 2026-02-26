#!/usr/bin/env tsx
/**
 * Check actor statuses to understand why only 1 actor is showing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStatuses() {
  console.log('🔍 Checking actor statuses...\n');
  
  // Get all statuses
  const { data: statuses } = await supabase
    .from('actor_statuses')
    .select('*')
    .order('id');
    
  console.log('📊 Available statuses:');
  statuses?.forEach(s => {
    console.log(`   ${s.id}: ${s.code} (${s.label || s.code})`);
  });
  
  console.log('\n📊 Actor counts by status:\n');
  
  // Get counts for each status
  for (const status of statuses || []) {
    const { data: actors, count } = await supabase
      .from('actors')
      .select('id, first_name, last_name', { count: 'exact', head: false })
      .eq('status_id', status.id)
      .limit(5);
      
    console.log(`   ${status.code.padEnd(15)} (ID ${status.id}): ${count || 0} actors`);
    
    if (actors && actors.length > 0 && count && count <= 5) {
      actors.forEach(a => {
        console.log(`      - ${a.first_name} ${a.last_name || ''}`);
      });
    }
  }
  
  // Check for null status_id
  const { count: nullCount } = await supabase
    .from('actors')
    .select('id', { count: 'exact', head: true })
    .is('status_id', null);
    
  if (nullCount && nullCount > 0) {
    console.log(`\n   ⚠️  NULL status_id: ${nullCount} actors`);
  }
  
  // Check legacy 'status' column if it exists
  console.log('\n🔍 Checking legacy status column...\n');
  
  const { data: legacyStatuses, error } = await supabase
    .from('actors')
    .select('status')
    .limit(1);
    
  if (!error) {
    const { data: liveActors, count: liveCount } = await supabase
      .from('actors')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'live');
      
    console.log(`   Legacy 'status' = 'live': ${liveCount || 0} actors`);
    
    if (liveCount && liveCount > 1) {
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log(`   ${liveCount} actors have status='live' (legacy column)`);
      console.log(`   But only 1 actor has status_id=1 (new column)`);
      console.log('\n💡 SOLUTION: Run migration to sync status → status_id');
    }
  }
}

checkStatuses().catch(console.error);
