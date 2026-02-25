import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from 1-SITE/apps/web/.env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkErrors() {
  console.log('🔍 Checking recent system events via Supabase...');
  try {
    const { data, error } = await supabase
      .from('system_events')
      .select('*')
      .eq('level', 'error')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    console.log('Recent Errors:');
    data.forEach(event => {
      console.log(`[${event.created_at}] ${event.message}`);
      if (event.details) {
        console.log('Details:', JSON.stringify(event.details, null, 2));
      }
      console.log('---');
    });
  } catch (err) {
    console.error('Failed to fetch events:', err);
  }
}

checkErrors();
