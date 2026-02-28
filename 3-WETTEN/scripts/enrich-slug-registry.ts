import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function enrichRegistry() {
  console.log('🚀 Starting Slug Registry Enrichment...');

  // 1. Get Worlds
  const { data: worlds } = await supabase.from('worlds').select('*');
  const worldMap = worlds?.reduce((acc, w) => ({ ...acc, [w.code]: w.id }), {} as any) || {};
  console.log('🌍 Worlds found:', Object.keys(worldMap));

  // 2. Core Entry Points
  const coreEntries = [
    { slug: 'studio', type: 'article', world: 'studio', journey: 'studio' },
    { slug: 'academy', type: 'article', world: 'academy', journey: 'academy' },
    { slug: 'ademing', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'ademing/bibliotheek', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'ademing/favorieten', type: 'article', world: 'ademing', journey: 'ademing' },
  ];

  for (const entry of coreEntries) {
    const worldId = worldMap[entry.world];
    console.log(`📍 Registering core entry: /${entry.slug} (World: ${entry.world}, ID: ${worldId})`);
    
    const { error } = await supabase
      .from('slug_registry')
      .upsert({
        slug: entry.slug,
        routing_type: entry.type,
        entity_id: 0, // Core pages often don't have a single entity
        // world_id: worldId, // Temporarily commented out until schema cache reloads
        journey: entry.journey,
        market_code: 'ALL',
        is_active: true
      }, { onConflict: 'slug, market_code, journey' });

    if (error) console.error(`❌ Error registering ${entry.slug}:`, error.message);
  }

  // 3. Academy Courses
  console.log('🎓 Fetching Academy Courses...');
  const { data: courses } = await supabase.from('courses').select('id, slug, title');
  if (courses) {
    for (const course of courses) {
      console.log(`   - Registering course: /academy/${course.slug}`);
      const { error } = await supabase
        .from('slug_registry')
        .upsert({
          slug: `academy/${course.slug}`,
          routing_type: 'article', // Or 'course' if we add that type
          entity_id: course.id,
          // world_id: worldMap['academy'],
          journey: 'academy',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });
      
      if (error) console.error(`❌ Error registering course ${course.slug}:`, error.message);
    }
  }

  // 4. Ademing Tracks
  console.log('🧘 Fetching Ademing Tracks...');
  const { data: tracks } = await supabase.from('ademing_tracks').select('id, slug, title');
  if (tracks) {
    for (const track of tracks) {
      console.log(`   - Registering track: /ademing/${track.slug}`);
      const { error } = await supabase
        .from('slug_registry')
        .upsert({
          slug: `ademing/${track.slug}`,
          routing_type: 'article', // Or 'track'
          entity_id: track.id,
          // world_id: worldMap['ademing'],
          journey: 'ademing',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });
      
      if (error) console.error(`❌ Error registering track ${track.slug}:`, error.message);
    }
  }

  // 5. Workshops (v2.16.097)
  console.log('🎧 Fetching Workshops...');
  const { data: workshops } = await supabase.from('workshops').select('id, slug, title').or('status.eq.publish,status.eq.live');
  if (workshops) {
    for (const workshop of workshops) {
      if (!workshop.slug) continue;
      console.log(`   - Registering workshop: /studio/${workshop.slug}`);
      const { error } = await supabase
        .from('slug_registry')
        .upsert({
          slug: `studio/${workshop.slug}`,
          routing_type: 'workshop',
          entity_id: workshop.id,
          entity_type_id: 5, // 🛡️ CHRIS-PROTOCOL: Workshop Entity Type
          // world_id: worldId,
          journey: 'studio',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });
      
      if (error) console.error(`❌ Error registering workshop ${workshop.slug}:`, error.message);
    }
  }

  console.log('✅ Enrichment Complete.');
}

enrichRegistry();
