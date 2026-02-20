
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchMedia() {
  const fileName = '1771486379792-mike.webp';
  console.log(`🔍 Searching media table for: ${fileName}`);

  const { data, error } = await supabase
    .from('media')
    .select('id, file_name, file_path, category')
    .eq('file_name', fileName);

  if (error) {
    console.error("❌ Error fetching media:", error.message);
    return;
  }

  console.log("✅ Media Data:");
  console.log(JSON.stringify(data, null, 2));
}

searchMedia();
