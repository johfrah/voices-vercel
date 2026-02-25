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

async function checkMusicProducts() {
  console.log('🔍 Checking for Music Products (free, away, before)...');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, category, description')
    .or('slug.eq.free,slug.eq.away,slug.eq.before,slug.eq.music')
    .or('category.ilike.%music%,name.ilike.%music%');

  if (error) {
    console.error('❌ Error fetching products:', error.message);
    return;
  }

  if (!products || products.length === 0) {
    console.log('⚠️ No specific music products found by slug/category.');
  } else {
    console.log(`✅ Found ${products.length} products:`);
    products.forEach(p => {
      console.log(`- [${p.id}] ${p.name} (slug: ${p.slug}, category: ${p.category})`);
    });
  }
}

checkMusicProducts().catch(console.error);
