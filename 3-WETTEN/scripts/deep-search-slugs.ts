import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepSearchSlugs() {
  const slugs = ['free', 'away', 'before'];
  const tables = ['content_articles', 'actors', 'workshops', 'locations', 'courses', 'artists', 'system_knowledge', 'products'];

  console.log(`☢️ Deep Searching Slugs: ${slugs.join(', ')} across ${tables.length} tables...`);

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .in('slug', slugs);

      if (error) {
        // Skip tables that might not exist in the current DB context
        continue;
      }

      if (data && data.length > 0) {
        console.log(`✅ Found in [${table}]:`);
        data.forEach(row => {
          console.log(`- [ID: ${row.id}] Slug: ${row.slug} | Name/Title: ${row.name || row.title || row.first_name}`);
        });
      }
    } catch (e) {}
  }

  // Also check media categories
  console.log('🔍 Checking media categories for music sub-types...');
  const { data: mediaCats } = await supabase.rpc('get_distinct_media_categories'); // If RPC exists, otherwise query
  const { data: mediaData } = await supabase.from('media').select('category').eq('category', 'music').limit(1);
  
  if (mediaData) {
    // Let's just query distinct categories from media where category is like music
    const { data: distinctCats } = await supabase.from('media').select('category').ilike('category', '%music%');
    const cats = [...new Set(distinctCats?.map(m => m.category))];
    console.log('Media Music Categories:', cats);
  }

  console.log('☢️ Search completed.');
}

deepSearchSlugs().catch(console.error);
