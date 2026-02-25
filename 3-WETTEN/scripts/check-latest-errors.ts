
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Fetching latest system events for AdminActorAPI...");
  
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .eq('source', 'AdminActorAPI')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error fetching system events:", error.message);
  } else {
    console.log("✅ Latest events:");
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
