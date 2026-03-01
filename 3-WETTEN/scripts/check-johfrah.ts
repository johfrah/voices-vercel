import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJohfrah() {
  console.log('🚀 Checking Johfrah actor record...');
  const { data, error } = await supabase
    .from('actors')
    .select('id, first_name, last_name, slug, photo_url, status, is_public')
    .ilike('first_name', '%Johfrah%');

  if (error) {
    console.error('❌ Error fetching actor:', error.message);
  } else {
    console.log('🔍 Johfrah record(s):', JSON.stringify(data, null, 2));
  }
}

checkJohfrah();
