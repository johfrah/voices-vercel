#!/usr/bin/env tsx
/**
 * EMERGENCY FIX: Set is_public = true for all live actors
 * 
 * The live site is showing only 1 actor because most actors have is_public = false.
 * This script fixes that by setting is_public = true for all actors with status_id = 1 (Live).
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from web app
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixIsPublic() {
  console.log('🔍 Checking current actor visibility...\n');
  
  // Get current counts
  const { data: allActors, error: allError } = await supabase
    .from('actors')
    .select('id, first_name, last_name, status_id, is_public')
    .eq('status_id', 1); // Live status
    
  if (allError) {
    console.error('❌ Error fetching actors:', allError);
    process.exit(1);
  }
  
  console.log(`📊 Found ${allActors?.length || 0} live actors`);
  
  const publicCount = allActors?.filter(a => a.is_public === true).length || 0;
  const privateCount = allActors?.filter(a => a.is_public === false || a.is_public === null).length || 0;
  
  console.log(`   ✅ Public: ${publicCount}`);
  console.log(`   ❌ Private/Null: ${privateCount}\n`);
  
  if (privateCount === 0) {
    console.log('✅ All live actors are already public!');
    return;
  }
  
  console.log(`🔧 Setting is_public = true for ${privateCount} actors...\n`);
  
  // Update all live actors to be public
  const { data: updated, error: updateError } = await supabase
    .from('actors')
    .update({ is_public: true })
    .eq('status_id', 1)
    .neq('is_public', true)
    .select('id, first_name, last_name');
    
  if (updateError) {
    console.error('❌ Error updating actors:', updateError);
    process.exit(1);
  }
  
  console.log(`✅ Updated ${updated?.length || 0} actors to is_public = true\n`);
  
  if (updated && updated.length > 0) {
    console.log('📝 Updated actors:');
    updated.slice(0, 10).forEach(a => {
      console.log(`   - ${a.first_name} ${a.last_name || ''} (ID: ${a.id})`);
    });
    if (updated.length > 10) {
      console.log(`   ... and ${updated.length - 10} more`);
    }
  }
  
  console.log('\n✅ DONE! All live actors are now public.');
  console.log('🔄 The live site should now show all actors within 60 seconds (cache refresh).');
}

fixIsPublic().catch(console.error);
