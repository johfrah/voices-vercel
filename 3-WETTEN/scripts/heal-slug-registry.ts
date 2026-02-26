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

async function healRegistry() {
  console.log('🚀 [CHRIS-PROTOCOL] Starting Slug Registry Healing...');

  try {
    // 1. Heal Actors
    console.log('\n--- HEALING ACTORS ---');
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
