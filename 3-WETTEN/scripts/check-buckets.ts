
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  console.log("🔍 Checking Supabase Storage buckets...");
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("❌ Error listing buckets:", error);
    process.exit(1);
  }
  
  console.log("✅ Buckets found:");
  data.forEach(b => console.log(`   - ${b.name} (Public: ${b.public})`));
  
  const visualsBucket = data.find(b => b.name === 'visuals');
  if (!visualsBucket) {
    console.log("⚠️ Bucket 'visuals' NOT FOUND!");
  } else {
    console.log("✅ Bucket 'visuals' exists.");
  }
  
  process.exit(0);
}

checkBuckets();
