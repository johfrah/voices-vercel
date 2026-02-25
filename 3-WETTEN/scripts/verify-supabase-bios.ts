
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 VERIFICATIE: Bio's in Supabase na cleanup...");

  // Controleer een aantal specifieke ID's die we hebben aangepast
  const targetIds = [1719, 1720, 1721, 1718, 1717, 1234];
  
  const { data: actors, error } = await supabase
    .from('actors')
    .select('id, first_name, last_name, bio, is_manually_edited')
    .in('id', targetIds);

  if (error) {
    console.error("❌ Error fetching actors:", error.message);
    return;
  }

  if (actors) {
    actors.forEach(actor => {
      console.log(`\n--- Actor: ${actor.first_name} ${actor.last_name || ''} (ID: ${actor.id}) ---`);
      console.log(`Manual Edit Lock: ${actor.is_manually_edited}`);
      console.log(`Bio Content: ${JSON.stringify(actor.bio)}`);
      
      // Check of er nog backslashes of \r\n in zitten
      const hasEscapes = /\\'|\\r|\\n/.test(actor.bio || '');
      console.log(`Status: ${hasEscapes ? '❌ NOG STEEDS VERVUILD' : '✅ SCHOON'}`);
    });
  }
}

main();
