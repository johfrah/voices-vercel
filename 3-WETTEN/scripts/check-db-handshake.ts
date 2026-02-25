import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('--- DATABASE HANDSHAKE AUDIT ---');
  
  const tables = ['languages', 'genders', 'journeys', 'media_types', 'countries'];
  
  for (const table of tables) {
    const { data, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact' });
      
    if (error) {
      console.error(`❌ TABLE: ${table} - Error: ${error.message}`);
    } else {
      console.log(`✅ TABLE: ${table} - Count: ${count}`);
      if (data && data.length > 0) {
        console.log(`   First 3 items:`, data.slice(0, 3).map(item => ({ id: item.id, code: item.code, label: item.label })));
      }
    }
  }
}

checkDatabase();
