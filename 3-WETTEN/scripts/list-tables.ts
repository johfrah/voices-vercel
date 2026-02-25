import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.rpc('get_table_names');
  if (error) {
    // If RPC doesn't exist, try a simple query
    const { data: tables, error: tableError } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    if (tableError) {
        console.error('Error fetching tables:', tableError);
        return;
    }
    console.log('Tables:', tables.map(t => t.table_name));
  } else {
    console.log('Tables:', data);
  }
}

main();
