import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMultiLangActors() {
  console.log('--- SEARCHING FOR MULTI-LANG ACTORS ---');
  const { data, error } = await supabase
    .from('actors')
    .select('first_name, extra_langs')
    .filter('status', 'eq', 'live');

  if (error) {
    console.error('ERROR:', error);
    return;
  }

  const results = data?.filter(a => {
    const langs = a.extra_langs?.toLowerCase() || '';
    return langs.includes('es') && langs.includes('de') && langs.includes('nl');
  });

  console.log('RESULTS:', JSON.stringify(results, null, 2));
  console.log('--- END ---');
}

findMultiLangActors();
