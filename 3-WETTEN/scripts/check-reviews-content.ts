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

async function checkReviews() {
  console.log('🔍 Checking reviews table for any mentions of Johfrah or specific business_slugs...');
  
  const { data, error } = await supabase.from('reviews').select('*').limit(50);
  
  if (error) {
    console.error('Error fetching reviews:', error);
    return;
  }

  console.log(`Fetched ${data.length} reviews.`);
  
  const businessSlugs = [...new Set(data.map(r => r.business_slug))];
  console.log('Unique business_slugs found:', businessSlugs);

  const johfrahMentions = data.filter(r => 
    (r.text_nl && r.text_nl.toLowerCase().includes('johfrah')) || 
    (r.text_en && r.text_en.toLowerCase().includes('johfrah'))
  );

  if (johfrahMentions.length > 0) {
    console.log(`Found ${johfrahMentions.length} reviews mentioning Johfrah:`);
    johfrahMentions.forEach(r => console.log(`- ID: ${r.id}, Author: ${r.author_name}, Text: ${r.text_nl?.substring(0, 50)}...`));
  } else {
    console.log('No reviews mentioning Johfrah found in the first 50.');
  }
  
  // Also check iap_context for any actor_id
  const withActorId = data.filter(r => r.iap_context && r.iap_context.actor_id);
  if (withActorId.length > 0) {
    console.log(`Found ${withActorId.length} reviews with actor_id in iap_context:`);
    withActorId.forEach(r => console.log(`- ID: ${r.id}, Actor ID: ${r.iap_context.actor_id}`));
  } else {
    console.log('No reviews with actor_id in iap_context found.');
  }
}

checkReviews();
