import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findMailboxErrors() {
  console.log('🔍 Searching for 500 errors in /api/mailbox/...');
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .ilike('message', '%/api/mailbox/%')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }

  if (data && data.length > 0) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('❌ No recent errors found in system_events for /api/mailbox/');
    
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: allErrors, error: allErr } = await supabase
      .from('system_events')
      .select('*')
      .eq('event_type', 'error')
      .gte('created_at', tenMinutesAgo)
      .order('created_at', { ascending: false });
      
    if (allErr) {
      console.error(allErr);
    } else {
      console.log(`Found ${allErrors?.length || 0} total errors in the last 10 minutes.`);
      console.log(JSON.stringify(allErrors, null, 2));
    }
  }
}

findMailboxErrors().catch(console.error);
