
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSystemEvents() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: SYSTEM EVENTS AUDIT ---');
  
  const { data, error } = await supabase
    .from('system_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch system events:', error);
    return;
  }

  console.table(data.map(e => ({
    id: e.id,
    level: e.level,
    source: e.source,
    message: e.message,
    created_at: e.created_at
  })));
}

checkSystemEvents();
