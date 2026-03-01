import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Zoek naar de .env.local file
const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
  console.log('🚀 SYNCING NEW ARTICLES TO SLUG REGISTRY...');

  const slugs = ['johfrai', 'freelance', 'portfolio', 'contact'];
  
  const { data: articles } = await supabase
    .from('content_articles')
    .select('id, slug, title')
    .in('slug', slugs);

  if (!articles) return;

  for (const article of articles) {
    const { data: existing } = await supabase
      .from('slug_registry')
      .select('id')
      .eq('entity_id', article.id)
      .eq('routing_type', 'article')
      .maybeSingle();

    if (!existing) {
      console.log(`➕ Registering ${article.slug} (ID: ${article.id})`);
      const { error } = await supabase.from('slug_registry').insert({
        entity_id: article.id,
        routing_type: 'article',
        slug: article.slug,
        journey: article.slug === 'johfrai' ? 'johfrai' : 'agency',
        market_code: 'ALL',
        is_active: true
      });
      if (error) console.error(`❌ Error: ${error.message}`);
    } else {
      console.log(`✅ ${article.slug} already registered.`);
    }
  }
  console.log('🏁 SYNC COMPLETED.');
}

sync();
