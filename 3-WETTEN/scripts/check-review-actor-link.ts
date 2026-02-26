import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLink() {
  console.log('🔍 Listing all tables to find review/actor links...');
  
  // Query information_schema via RPC or direct SQL if possible, 
  // but since we only have supabase client, let's try to list tables by guessing or using a known trick.
  // Actually, the best way with supabase-js is to try and select from suspected tables.
  
  const suspectedTables = ['actor_reviews', 'reviews_to_actors', 'actor_review_links', 'reviews_actors'];
  
  for (const table of suspectedTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✅ Table found: ${table}`);
      // If found, get more info
      const { data: fullData } = await supabase.from(table).select('*');
      console.log(`Structure/Data:`, fullData);
    } else if (error.code !== 'PGRST116' && error.code !== '42P01') {
      // 42P01 is "relation does not exist" in Postgres
      console.log(`Table ${table} error:`, error.message);
    }
  }

  console.log('\n🔍 Checking reviews table for any actor-related columns...');
  const { data: reviewsData, error: reviewsError } = await supabase.from('reviews').select('*').limit(1);
  if (!reviewsError && reviewsData && reviewsData.length > 0) {
    console.log('Columns in reviews table:', Object.keys(reviewsData[0]));
  } else {
    console.log('Could not fetch reviews or table is empty.');
  }

  console.log('\n🔍 Checking for Johfrah in actors...');
  const { data: johfrah, error: actorError } = await supabase.from('actors').select('id, first_name').ilike('first_name', '%Johfrah%');
  if (johfrah && johfrah.length > 0) {
    console.log(`Found Johfrah with ID: ${johfrah[0].id}`);
    
    // Now check if any reviews are linked to this ID if we found a link column
    // (This part depends on what we find above)
  } else {
    console.log('Johfrah not found in actors table.');
  }
}

checkLink();
