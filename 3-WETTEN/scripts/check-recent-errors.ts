import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env vars from web app
config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRecentErrors() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .in('level', ['error', 'critical'])
    .gte('created_at', tenMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Query error:', error);
    process.exit(1);
  }

  console.log(`\n🔍 Recent errors (last 10 minutes): ${data?.length || 0}\n`);
  
  if (data && data.length > 0) {
    data.forEach(e => {
      console.log(`- [${new Date(e.created_at).toLocaleTimeString()}] [${e.level?.toUpperCase()}] ${e.source}: ${e.message}`);
      if (e.details) console.log(`  Details: ${JSON.stringify(e.details).substring(0, 150)}`);
    });
  } else {
    console.log('✅ No errors in the last 10 minutes!');
  }
}

checkRecentErrors();
