import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSlug() {
  const targetSlug = 'verwen-je-stem';
  const fullSlug = 'studio/verwen-je-stem';

  console.log(`🔍 Diagnosing slugs: "${targetSlug}" and "${fullSlug}"`);

  // 1. Check slug_registry
  const { data: registryEntries, error: regError } = await supabase
    .from('slug_registry')
    .select('*')
    .or(`slug.eq.${targetSlug},slug.eq.${fullSlug}`);

  console.log('\n--- slug_registry ---');
  if (regError) console.error('❌ Error:', regError);
  else console.log(registryEntries && registryEntries.length > 0 ? registryEntries : '❌ Not found in registry');

  // 2. Check content_articles
  const { data: articles, error: artError } = await supabase
    .from('content_articles')
    .select('id, slug, title, status')
    .or(`slug.eq.${targetSlug},slug.eq.${fullSlug}`);

  console.log('\n--- content_articles ---');
  if (artError) console.error('❌ Error:', artError);
  else console.log(articles && articles.length > 0 ? articles : '❌ Not found in articles');

  // 3. Check workshops
  const { data: workshops, error: workError } = await supabase
    .from('workshops')
    .select('id, slug, title')
    .or(`slug.eq.${targetSlug},slug.eq.${fullSlug}`);

  console.log('\n--- workshops ---');
  if (workError) console.error('❌ Error:', workError);
  else console.log(workshops && workshops.length > 0 ? workshops : '❌ Not found in workshops');
}

diagnoseSlug();
