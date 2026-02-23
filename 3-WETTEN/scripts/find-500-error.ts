import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findError() {
  console.log('🔍 Searching for 500 error in /api/admin/actors...');
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .ilike('message', '%/api/admin/actors%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

findError().catch(console.error);
