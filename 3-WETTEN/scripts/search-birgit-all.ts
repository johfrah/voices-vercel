
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchBirgitAll() {
  console.log("🔍 Searching for all Birgits in database...");
  const { data, error } = await supabase
    .from('actors')
    .select('id, wp_product_id, first_name, last_name')
    .ilike('first_name', 'Birgit%');
    
  if (data) {
    data.forEach(a => console.log(`✅ ID=${a.id}, wpProductId=${a.wp_product_id}, name=${a.first_name} ${a.last_name}`));
  }
  
  process.exit(0);
}

searchBirgitAll();
