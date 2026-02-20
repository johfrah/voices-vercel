
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMedia() {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .in('id', [4740, 4739, 4711, 4668]);
    
  if (error) {
    console.error("❌ Error fetching media:", error.message);
    return;
  }
  
  console.log("✅ Media Data:");
  console.log(JSON.stringify(data, null, 2));
}

checkMedia();
