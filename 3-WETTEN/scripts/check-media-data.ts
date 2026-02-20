
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMediaData() {
  console.log("🔍 Checking media table for actor photos...");
  
  const { data, error } = await supabase
    .from('media')
    .select('id, file_name, file_path, category')
    .ilike('file_name', '%mark%')
    .limit(10);
    
  if (error) {
    console.error("❌ Error fetching media:", error.message);
    return;
  }
  
  console.log("✅ Media Data (Mark):");
  console.log(JSON.stringify(data, null, 2));

  const { data: data2, error: error2 } = await supabase
    .from('media')
    .select('id, file_name, file_path, category')
    .ilike('file_name', '%birgit%')
    .limit(10);

  console.log("\n✅ Media Data (Birgit):");
  console.log(JSON.stringify(data2, null, 2));
}

checkMediaData();
