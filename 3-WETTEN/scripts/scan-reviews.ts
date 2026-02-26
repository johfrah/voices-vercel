import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from 1-SITE/apps/web/.env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("--- Scanning reviews table for actor references ---");
  
  // 1. Check for Johfrah in text fields
  const { data: johfrahInText, error: error1 } = await supabase
    .from('reviews')
    .select('id, author_name, text_nl, iap_context, business_slug')
    .or('text_nl.ilike.%Johfrah%,text_fr.ilike.%Johfrah%,text_en.ilike.%Johfrah%,text_de.ilike.%Johfrah%');

  if (error1) {
    console.error("Error fetching reviews by text:", error1);
  } else {
    console.log(`\nFound ${johfrahInText?.length || 0} reviews mentioning 'Johfrah' in text fields.`);
    if (johfrahInText && johfrahInText.length > 0) {
      console.log("Sample mentions:");
      johfrahInText.slice(0, 5).forEach(row => {
        console.log(`- ID: ${row.id}, Author: ${row.author_name}, Business Slug: ${row.business_slug}`);
        console.log(`  Text: ${row.text_nl?.substring(0, 100)}...`);
      });
    }
  }

  // 2. Check for other business_slugs
  const { data: slugs, error: errorSlugs } = await supabase
    .from('reviews')
    .select('business_slug')
    .not('business_slug', 'is', null);
  
  if (slugs) {
    const uniqueSlugs = [...new Set(slugs.map(s => s.business_slug))];
    console.log(`\nUnique business_slugs found: ${uniqueSlugs.join(', ')}`);
  }

  // 3. Check for Johfrah in actors table to get ID
  const { data: actorJohfrah, error: errorActor } = await supabase
    .from('actors')
    .select('id, first_name, last_name, slug')
    .ilike('first_name', 'Johfrah');
  
  if (actorJohfrah && actorJohfrah.length > 0) {
    console.log(`\nFound Johfrah in actors table: ID=${actorJohfrah[0].id}, Slug=${actorJohfrah[0].slug}`);
  }
}

main().catch(console.error);
