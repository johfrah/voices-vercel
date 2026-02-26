import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkYoussefRouting() {
  console.log('🔍 CHECKING YOUSSEF ROUTING IN DATABASE\n');

  // 1. Check url_routing table for artist/youssef
  console.log('📊 Step 1: Checking url_routing table...');
  const { data: routing, error: routingError } = await supabase
    .from('url_routing')
    .select('*')
    .eq('slug', 'artist/youssef');

  if (routingError) {
    console.error('❌ Error fetching routing:', routingError);
  } else if (!routing || routing.length === 0) {
    console.error('❌ No routing found for "artist/youssef"');
    
    // Check for alternative slugs
    console.log('\n🔍 Checking for alternative artist slugs...');
    const { data: artistRoutes } = await supabase
      .from('url_routing')
      .select('*')
      .like('slug', '%youssef%');
    
    if (artistRoutes && artistRoutes.length > 0) {
      console.log('✅ Found alternative routes:');
      artistRoutes.forEach(r => {
        console.log(`   - ${r.slug} (type: ${r.routing_type}, entity_id: ${r.entity_id})`);
      });
    } else {
      console.log('❌ No routes found with "youssef" in slug');
    }
  } else {
    console.log('✅ Routing found:');
    routing.forEach(r => {
      console.log(`   - Slug: ${r.slug}`);
      console.log(`   - Routing Type: ${r.routing_type}`);
      console.log(`   - Entity ID: ${r.entity_id}`);
      console.log(`   - Market Code: ${r.market_code}`);
      console.log(`   - Status: ${r.status}`);
    });
  }

  // 2. Check all artist routes
  console.log('\n📊 Step 2: Checking all artist routes...');
  const { data: allArtistRoutes, error: artistRoutesError } = await supabase
    .from('url_routing')
    .select('*')
    .eq('routing_type', 'artist');

  if (artistRoutesError) {
    console.error('❌ Error fetching artist routes:', artistRoutesError);
  } else {
    console.log(`✅ Found ${allArtistRoutes?.length || 0} artist routes:`);
    allArtistRoutes?.forEach(r => {
      console.log(`   - ${r.slug} (entity_id: ${r.entity_id}, market: ${r.market_code})`);
    });
  }

  // 3. Check artists table
  console.log('\n📊 Step 3: Checking artists table for Youssef...');
  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('id, slug, display_name, status, is_public')
    .eq('slug', 'youssef')
    .single();

  if (artistError) {
    console.error('❌ Error fetching artist:', artistError);
  } else if (!artist) {
    console.error('❌ Artist not found');
  } else {
    console.log('✅ Artist found:');
    console.log(`   - ID: ${artist.id}`);
    console.log(`   - Slug: ${artist.slug}`);
    console.log(`   - Display Name: ${artist.display_name}`);
    console.log(`   - Status: ${artist.status}`);
    console.log(`   - Is Public: ${artist.is_public}`);
  }
}

checkYoussefRouting().catch(console.error);
