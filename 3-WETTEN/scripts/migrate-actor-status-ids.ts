#!/usr/bin/env tsx
/**
 * EMERGENCY MIGRATION: Sync legacy status column to status_id
 * 
 * 460 actors have status='live' but status_id=NULL
 * This migration fixes that by setting status_id=1 for all actors with status='live'
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateStatusIds() {
  console.log('🚀 Starting actor status migration...\n');
  
  // Status mapping
  const statusMap: Record<string, number> = {
    'live': 1,
    'pending': 2,
    'approved': 3,
    'rejected': 4,
    'active': 5,
    'publish': 6,
    'cancelled': 7
  };
  
  console.log('📋 Status mapping:');
  Object.entries(statusMap).forEach(([code, id]) => {
    console.log(`   '${code}' → status_id ${id}`);
  });
  console.log('');
  
  // Get all actors with NULL status_id
  const { data: actorsToMigrate, error: fetchError } = await supabase
    .from('actors')
    .select('id, first_name, last_name, status')
    .is('status_id', null);
    
  if (fetchError) {
    console.error('❌ Error fetching actors:', fetchError);
    process.exit(1);
  }
  
  console.log(`📊 Found ${actorsToMigrate?.length || 0} actors with NULL status_id\n`);
  
  if (!actorsToMigrate || actorsToMigrate.length === 0) {
    console.log('✅ No migration needed!');
    return;
  }
  
  // Group by status
  const grouped: Record<string, any[]> = {};
  actorsToMigrate.forEach(actor => {
    const status = actor.status || 'unknown';
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push(actor);
  });
  
  console.log('📊 Actors by legacy status:');
  Object.entries(grouped).forEach(([status, actors]) => {
    const targetId = statusMap[status] || null;
    console.log(`   '${status}': ${actors.length} actors → status_id ${targetId || 'UNKNOWN'}`);
  });
  console.log('');
  
  // Migrate each group
  let totalMigrated = 0;
  
  for (const [legacyStatus, actors] of Object.entries(grouped)) {
    const targetStatusId = statusMap[legacyStatus];
    
    if (!targetStatusId) {
      console.log(`⚠️  Skipping ${actors.length} actors with unknown status '${legacyStatus}'`);
      continue;
    }
    
    console.log(`🔧 Migrating ${actors.length} actors from '${legacyStatus}' to status_id ${targetStatusId}...`);
    
    const actorIds = actors.map(a => a.id);
    
    const { data: updated, error: updateError } = await supabase
      .from('actors')
      .update({ status_id: targetStatusId })
      .in('id', actorIds)
      .select('id');
      
    if (updateError) {
      console.error(`❌ Error updating actors:`, updateError);
      continue;
    }
    
    console.log(`   ✅ Updated ${updated?.length || 0} actors\n`);
    totalMigrated += updated?.length || 0;
  }
  
  console.log(`\n✅ MIGRATION COMPLETE!`);
  console.log(`   Total migrated: ${totalMigrated} actors`);
  console.log(`   Live actors (status_id=1): ${grouped['live']?.length || 0}`);
  console.log('\n🔄 The live site should now show all actors within 60 seconds.');
}

migrateStatusIds().catch(console.error);
