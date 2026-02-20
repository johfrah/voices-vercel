
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllMediaPaths() {
  console.log("🔍 Checking for media paths missing 'visuals/' prefix in 'active/voicecards'...");

  const { data, error } = await supabase
    .from('media')
    .select('id, file_path, file_name')
    .ilike('file_path', 'active/voicecards/%')
    .not('file_path', 'ilike', 'visuals/%');

  if (error) {
    console.error("❌ Error fetching media:", error.message);
    return;
  }

  console.log(`✅ Found ${data.length} media records missing 'visuals/' prefix.`);
  if (data.length > 0) {
    console.log("Sample records:");
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  }
}

checkAllMediaPaths();
