import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findOrdersError() {
  console.log('🔍 Searching for actual errors (not info logs)...\n');
  
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .eq('level', 'error')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error querying database:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ No errors found related to orders page.');
    return;
  }

  console.log(`Found ${data.length} error(s):\n`);
  data.forEach((event, index) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ERROR ${index + 1}/${data.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📅 Time: ${event.created_at}`);
    console.log(`🎯 Level: ${event.level}`);
    console.log(`📍 Source: ${event.source}`);
    console.log(`💬 Message: ${event.message}`);
    if (event.details) {
      console.log(`🔍 Details:`);
      try {
        const details = typeof event.details === 'string' ? JSON.parse(event.details) : event.details;
        console.log(JSON.stringify(details, null, 2));
      } catch {
        console.log(event.details);
      }
    }
  });
}

findOrdersError().catch(console.error);
