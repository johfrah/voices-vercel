
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPhotosFolder() {
  console.log("🔍 Listing files in 'voices' bucket, folder 'active/photos'...");
  const { data, error } = await supabase.storage.from('voices').list('active/photos', {
    limit: 10
  });
  
  if (error) {
    console.error("❌ Error listing files:", error);
    process.exit(1);
  }
  
  console.log("✅ Files found:");
  data.forEach(f => console.log(`   - ${f.name}`));
  
  process.exit(0);
}

checkPhotosFolder();
