
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActorIds() {
  const names = ['Birgit', 'Christina', 'Mona', 'Hannelore', 'Annelies', 'Veerle'];
  console.log("🔍 Checking actor IDs in database...");
  
  for (const name of names) {
    const { data, error } = await supabase
      .from('actors')
      .select('id, wp_product_id, first_name')
      .ilike('first_name', `${name}%`)
      .limit(1);
      
    if (data && data.length > 0) {
      console.log(`✅ ${name}: ID=${data[0].id}, wpProductId=${data[0].wp_product_id}`);
    } else {
      console.log(`❌ ${name} not found`);
    }
  }
  
  process.exit(0);
}

checkActorIds();
