
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listStorage() {
  console.log("📂 Listing files in 'voices' bucket under 'visuals/active/voicecards/'...");
  
  const { data, error } = await supabase.storage
    .from('voices')
    .list('visuals/active/voicecards', {
      limit: 10,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    
  if (error) {
    console.error("❌ Error listing storage:", error.message);
    return;
  }
  
  console.log("✅ Files found:");
  console.log(JSON.stringify(data, null, 2));

  console.log("\n📂 Listing files in 'voices' bucket under 'active/voicecards/' (without visuals prefix)...");
  const { data: data2, error: error2 } = await supabase.storage
    .from('voices')
    .list('active/voicecards', {
      limit: 10,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error2) {
    console.error("❌ Error listing storage (no prefix):", error2.message);
  } else {
    console.log("✅ Files found (no prefix):");
    console.log(JSON.stringify(data2, null, 2));
  }
}

listStorage();
