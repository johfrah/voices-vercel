
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchActorsByDropboxUrl() {
  const pattern = '%1771486379792-mike%';
  console.log(`🔍 Searching actors table for dropbox_url like: ${pattern}`);

  const { data, error } = await supabase
    .from('actors')
    .select('id, first_name, dropbox_url, photo_id')
    .ilike('dropbox_url', pattern);

  if (error) {
    console.error("❌ Error fetching actors:", error.message);
    return;
  }

  console.log("✅ Actor Data:");
  console.log(JSON.stringify(data, null, 2));
}

searchActorsByDropboxUrl();
