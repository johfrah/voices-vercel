
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Checking columns of 'actor_demos'...");
  
  const { data, error } = await supabase
    .from('actor_demos')
    .select('*')
    .limit(1);

  if (error) {
    console.error("❌ Error fetching from actor_demos:", error.message);
  } else {
    console.log("✅ Successfully fetched from actor_demos.");
    if (data && data.length > 0) {
      console.log("Available columns:", Object.keys(data[0]));
    } else {
      console.log("Table is empty, cannot determine columns via select *.");
      
      // Try to insert a dummy record with only basic fields to see what fails
      console.log("Trying dummy insert with only actor_id, name, url...");
      const { error: insertError } = await supabase
        .from('actor_demos')
        .insert({ actor_id: 1718, name: 'Test', url: 'https://test.com' });
      
      if (insertError) {
        console.error("❌ Dummy insert failed:", insertError.message);
      } else {
        console.log("✅ Dummy insert succeeded with basic fields.");
      }
    }
  }
}

main();
