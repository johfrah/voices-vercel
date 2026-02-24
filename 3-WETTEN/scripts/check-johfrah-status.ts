import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJohfrah() {
  console.log('--- CHECKING ACTOR JOHFRAH ---');
  const { data, error } = await supabase
    .from('actors')
    .select('id, slug, first_name, status, is_public')
    .or('slug.eq.johfrah,first_name.ilike.%johfrah%');

  if (error) {
    console.error('ERROR:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No actor found with slug "johfrah" or first name "johfrah".');
  } else {
    console.log('RESULTS:', JSON.stringify(data, null, 2));
    data.forEach(actor => {
      console.log(`Actor: ${actor.first_name} (${actor.slug})`);
      console.log(`Status: ${actor.status}`);
      console.log(`Is Public: ${actor.is_public}`);
      
      if (actor.status !== 'live' || !actor.is_public) {
        console.log('⚠️ This actor is NOT live or NOT public, which is why he might be "spoorloos".');
      } else {
        console.log('✅ This actor is live and public.');
      }
    });
  }
  console.log('--- END ---');
}

checkJohfrah();
