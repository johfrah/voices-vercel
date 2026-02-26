import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllTables() {
  console.log('🔍 Fetching all table names from information_schema...');
  
  // Using RPC to execute raw SQL if available, or trying to query information_schema directly
  // Note: Supabase JS client doesn't support direct SQL unless an RPC is set up.
  // However, we can try to query a system table if permissions allow.
  
  const { data, error } = await supabase.rpc('get_tables'); // Guessing if there's an RPC
  
  if (error) {
    console.log('RPC get_tables failed, trying direct query on information_schema.tables (might fail)...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      console.log('Direct query failed:', tablesError.message);
      console.log('Plan B: Searching schema/index.ts more thoroughly for any table starting with "actor" or "review"');
    } else {
      console.log('Tables found:', tables.map(t => t.table_name));
    }
  } else {
    console.log('Tables found via RPC:', data);
  }
}

checkAllTables();
