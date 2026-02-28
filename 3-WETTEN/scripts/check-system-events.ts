import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWatchdogLogs() {
  console.log('🔍 Fetching latest Watchdog logs (system_events)...');

  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error fetching logs:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('✅ No system events found.');
    return;
  }

  data.forEach(event => {
    const date = new Date(event.created_at).toLocaleString('nl-BE');
    const level = event.level === 'error' ? '🔴' : (event.level === 'warning' ? '🟡' : '🔵');
    console.log(`${level} [${date}] ${event.event_type}: ${event.message}`);
    if (event.metadata) {
        try {
            const meta = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
            if (meta.pathname) console.log(`   📍 Path: ${meta.pathname}`);
            if (meta.error_stack) console.log(`   🥞 Stack: ${meta.error_stack.substring(0, 200)}...`);
        } catch (e) {
            // console.log(`   📦 Meta: ${event.metadata}`);
        }
    }
    console.log('---');
  });
}

checkWatchdogLogs();
