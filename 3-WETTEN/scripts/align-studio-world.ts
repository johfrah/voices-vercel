/**
 * 🚀 NUCLEAR WORLD ALIGNMENT SCRIPT (v2.16.095)
 * 
 * Synchronizes world_id for Studio content in workshops and slug_registry.
 * This anchors the Studio World (ID 2) as the Source of Truth.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function alignStudioWorld() {
  console.log('🛡️ Starting Nuclear World Alignment for Studio (ID 2)...');

  // 1. Update Workshops
  console.log('📦 Updating workshops table...');
  const { data: workshops, error: workshopError } = await supabase
    .from('workshops')
    .update({ world_id: 2 })
    .or('status.eq.publish,status.eq.live,is_public.eq.true');

  if (workshopError) {
    console.error('❌ Error updating workshops:', workshopError.message);
  } else {
    console.log('✅ Workshops aligned to Studio World (ID 2).');
  }

  // 2. Update Slug Registry
  console.log('🛤️ Updating slug_registry table...');
  const { data: slugs, error: slugError } = await supabase
    .from('slug_registry')
    .update({ world_id: 2, journey: 'studio' })
    .ilike('slug', 'studio%');

  if (slugError) {
    console.error('❌ Error updating slug_registry:', slugError.message);
  } else {
    console.log('✅ Slug Registry aligned to Studio World (ID 2).');
  }

  // 3. Verify Alignment
  console.log('📊 Verifying alignment...');
  const { count: workshopCount } = await supabase
    .from('workshops')
    .select('*', { count: 'exact', head: true })
    .eq('world_id', 2);

  const { count: slugCount } = await supabase
    .from('slug_registry')
    .select('*', { count: 'exact', head: true })
    .eq('world_id', 2);

  console.log(`📈 Alignment Report: ${workshopCount} workshops, ${slugCount} slugs anchored to Studio World.`);
  console.log('🏁 Nuclear World Alignment Complete.');
}

alignStudioWorld().catch(err => {
  console.error('💥 Fatal Error during alignment:', err);
  process.exit(1);
});
