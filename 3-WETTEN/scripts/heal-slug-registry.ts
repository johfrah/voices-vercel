import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 Credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🛡️ CHRIS-PROTOCOL: World ID Bible (v2.23.0)
const WORLD_BIBLE: Record<string, { world_id: number, routing_type: string, journey: string }> = {
  'contact': { world_id: 0, routing_type: 'article', journey: 'agency' },
  'terms': { world_id: 0, routing_type: 'article', journey: 'agency' },
  'privacy': { world_id: 0, routing_type: 'article', journey: 'agency' },
  'cookies': { world_id: 0, routing_type: 'article', journey: 'agency' },
  'agency': { world_id: 1, routing_type: 'article', journey: 'agency' },
  'studio': { world_id: 2, routing_type: 'article', journey: 'studio' },
  'academy': { world_id: 3, routing_type: 'article', journey: 'academy' },
  'portfolio': { world_id: 5, routing_type: 'article', journey: 'portfolio' },
  'ademing': { world_id: 6, routing_type: 'article', journey: 'ademing' },
  'freelance': { world_id: 7, routing_type: 'article', journey: 'freelance' },
  'partners': { world_id: 8, routing_type: 'article', journey: 'partner' },
  'johfrai': { world_id: 10, routing_type: 'article', journey: 'johfrai' },
  'artist/youssef': { world_id: 25, routing_type: 'article', journey: 'artist' },
  'studio/contact': { world_id: 2, routing_type: 'article', journey: 'studio' },
  'studio/faq': { world_id: 2, routing_type: 'article', journey: 'studio' }
};

async function healRegistry() {
  console.log('🚀 [CHRIS-PROTOCOL] Starting Slug Registry Healing & Bible Sync...');

  try {
    // 1. Sync Bible Worlds & Routing Types
    console.log('\n--- SYNCING BIBLE WORLDS ---');
    for (const [slug, bible] of Object.entries(WORLD_BIBLE)) {
      console.log(`  📖 Syncing ${slug} -> World ${bible.world_id}`);
      
      // 🛡️ CHRIS-PROTOCOL: Manual check then update/insert for core bible slugs
      const { data: article } = await supabase
        .from('content_articles')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (article) {
        const { data: existing } = await supabase
          .from('slug_registry')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('slug_registry')
            .update({ 
              entity_id: article.id,
              world_id: bible.world_id, 
              routing_type: bible.routing_type,
              journey: bible.journey,
              is_active: true,
              market_code: 'ALL'
            })
            .eq('slug', slug);
          if (error) console.error(`   ❌ Failed to update ${slug}: ${error.message}`);
          else console.log(`   ✅ Updated ${slug}`);
        } else {
          const { error } = await supabase
            .from('slug_registry')
            .insert({ 
              slug: slug,
              entity_id: article.id,
              world_id: bible.world_id, 
              routing_type: bible.routing_type,
              journey: bible.journey,
              is_active: true,
              market_code: 'ALL'
            });
          if (error) console.error(`   ❌ Failed to insert ${slug}: ${error.message}`);
          else console.log(`   ✅ Inserted ${slug}`);
        }
      } else {
        console.warn(`   ⚠️ Article not found for slug: ${slug}. Skipping registry sync.`);
      }
    }

    // 2. Heal Actors
    console.log('\n--- HEALING ACTORS ---');
    // ... (existing actor healing logic)
    const { data: missingActors } = await supabase.rpc('get_missing_actors_in_registry');
    // Note: If RPC doesn't exist, we fallback to manual query
    
    const actorsQuery = await supabase
      .from('actors')
      .select('id, first_name, slug')
      .eq('status', 'live')
      .eq('is_public', true);
    
    const actors = actorsQuery.data || [];
    let actorHealed = 0;

    for (const actor of actors) {
      if (!actor.slug) continue;

      const { data: existing } = await supabase
        .from('slug_registry')
        .select('id')
        .eq('entity_id', actor.id)
        .eq('entity_type_id', 1)
        .limit(1)
        .single();

      if (!existing) {
        console.log(`  ☢️  Healing Actor: ${actor.first_name} (${actor.slug})`);
        const { error } = await supabase.from('slug_registry').insert({
          entity_id: actor.id,
          routing_type: 'actor',
          slug: actor.slug.toLowerCase(),
          market_code: 'ALL',
          journey: 'agency',
          is_active: true
        });
        if (!error) actorHealed++;
        else console.error(`   ❌ Failed: ${error.message}`);
      }
    }
    console.log(`✅ Healed ${actorHealed} actors.`);

    // 2. Heal Articles
    console.log('\n--- HEALING ARTICLES ---');
    const articlesQuery = await supabase
      .from('content_articles')
      .select('id, title, slug, iapContext')
      .eq('status', 'publish');
    
    const articles = articlesQuery.data || [];
    let articleHealed = 0;

    for (const article of articles) {
      if (!article.slug) continue;

      const { data: existing } = await supabase
        .from('slug_registry')
        .select('id')
        .eq('entity_id', article.id)
        .eq('routing_type', 'article')
        .limit(1)
        .single();

      if (!existing) {
        console.log(`  ☢️  Healing Article: ${article.title} (${article.slug})`);
        const { error } = await supabase.from('slug_registry').insert({
          entity_id: article.id,
          routing_type: 'article',
          slug: article.slug.toLowerCase(),
          market_code: 'ALL',
          journey: (article.iapContext as any)?.journey || 'agency',
          is_active: true
        });
        if (!error) articleHealed++;
        else console.error(`   ❌ Failed: ${error.message}`);
      }
    }
    console.log(`✅ Healed ${articleHealed} articles.`);

  } catch (error) {
    console.error('❌ Healing failed:', error);
  }
}

healRegistry();
