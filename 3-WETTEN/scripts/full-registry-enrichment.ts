import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fullEnrichment() {
  console.log('🚀 Starting Full Slug Registry Enrichment (v2.16.098)...');

  // 1. Get Worlds & Entity Types
  const { data: worlds } = await supabase.from('worlds').select('*');
  const worldMap = worlds?.reduce((acc, w) => ({ ...acc, [w.code]: w.id }), {} as any) || {};
  
  const { data: entityTypes } = await supabase.from('entity_types').select('*');
  const typeMap = entityTypes?.reduce((acc, t) => ({ ...acc, [t.code]: t.id }), {} as any) || {};

  console.log('🌍 Worlds:', Object.keys(worldMap));
  console.log('🏗️ Entity Types:', Object.keys(typeMap));

  // 2. CORE ENTRY POINTS (Worlds)
  const coreEntries = [
    { slug: 'studio', type: 'article', world: 'studio', journey: 'studio' },
    { slug: 'academy', type: 'article', world: 'academy', journey: 'academy' },
    { slug: 'ademing', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'ademing/bibliotheek', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'ademing/favorieten', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'ademing/zoeken', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'ademing/mijn-ademing', type: 'article', world: 'ademing', journey: 'ademing' },
    { slug: 'tarieven', type: 'article', world: 'agency', journey: 'agency' },
    { slug: 'hoe-het-werkt', type: 'article', world: 'agency', journey: 'agency' },
    { slug: 'contact', type: 'article', world: 'agency', journey: 'agency' },
  ];

  for (const entry of coreEntries) {
    console.log(`📍 Registering core entry: /${entry.slug}`);
    await supabase.from('slug_registry').upsert({
      slug: entry.slug,
      routing_type: entry.type,
      entity_id: 0,
      entity_type_id: typeMap[entry.type] || 3,
      world_id: worldMap[entry.world],
      journey: entry.journey,
      market_code: 'ALL',
      is_active: true
    }, { onConflict: 'slug, market_code, journey' });
  }

  // 3. ARTICLES (CMS Content)
  console.log('📄 Fetching Articles...');
  const { data: articles } = await supabase.from('content_articles').select('id, slug, status').eq('status', 'publish');
  if (articles) {
    for (const art of articles) {
      if (!art.slug) continue;
      console.log(`   - Registering article: /${art.slug}`);
      await supabase.from('slug_registry').upsert({
        slug: art.slug.toLowerCase(),
        routing_type: 'article',
        entity_id: art.id,
        entity_type_id: typeMap['article'] || 3,
        market_code: 'ALL',
        journey: 'agency',
        is_active: true
      }, { onConflict: 'slug, market_code, journey' });
    }
  }

  // 4. ARTISTS (Artist World)
  console.log('🎨 Fetching Artists...');
  const { data: artists } = await supabase.from('artists').select('id, slug');
  if (artists) {
    for (const artist of artists) {
      if (!artist.slug) continue;
      console.log(`   - Registering artist: /artist/${artist.slug}`);
      await supabase.from('slug_registry').upsert({
        slug: `artist/${artist.slug.toLowerCase()}`,
        routing_type: 'artist',
        entity_id: artist.id,
        entity_type_id: typeMap['artist'] || 2,
        world_id: worldMap['artist'],
        journey: 'artist',
        market_code: 'ALL',
        is_active: true
      }, { onConflict: 'slug, market_code, journey' });
    }
  }

  // 5. ACTORS (Agency World - Deep Slugs)
  console.log('🎙️ Fetching Actors...');
  const { data: actors } = await supabase.from('actors').select('id, slug').eq('status', 'live');
  if (actors) {
    for (const actor of actors) {
      if (!actor.slug) continue;
      const baseSlug = `voice/${actor.slug.toLowerCase()}`;
      console.log(`   - Registering actor: /${baseSlug}`);
      
      // Register base actor page
      await supabase.from('slug_registry').upsert({
        slug: baseSlug,
        routing_type: 'actor',
        entity_id: actor.id,
        entity_type_id: typeMap['actor'] || 1,
        world_id: worldMap['agency'],
        journey: 'agency',
        market_code: 'ALL',
        is_active: true
      }, { onConflict: 'slug, market_code, journey' });

      // Register journey-specific deep slugs
      const journeys = ['video', 'telephony', 'commercial'];
      for (const j of journeys) {
        await supabase.from('slug_registry').upsert({
          slug: `${baseSlug}/${j}`,
          routing_type: 'actor',
          entity_id: actor.id,
          entity_type_id: typeMap['actor'] || 1,
          world_id: worldMap['agency'],
          journey: j,
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });
      }
    }
  }

  console.log('✅ Full Enrichment Complete.');
}

fullEnrichment();
