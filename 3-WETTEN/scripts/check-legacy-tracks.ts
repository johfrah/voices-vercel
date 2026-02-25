
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLegacyTracks() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: LEGACY TRACKS TABLE AUDIT ---');
  
  const { data, error } = await supabase
    .from('tracks')
    .select('*');

  if (error) {
    console.warn('Legacy table "tracks" not found or error:', error.message);
    return;
  }

  console.table(data.map(t => ({
    id: t.id,
    title: t.title,
    is_published: t.is_published,
    slug: t.slug
  })));
}

checkLegacyTracks();
