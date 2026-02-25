
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllTracks() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ALL ADEMING TRACKS AUDIT ---');
  
  const { data, error } = await supabase
    .from('ademing_tracks')
    .select('*');

  if (error) {
    console.error('Failed to fetch tracks:', error);
    return;
  }

  console.table(data.map(t => ({
    id: t.id,
    title: t.title,
    is_public: t.is_public,
    slug: t.slug
  })));
}

checkAllTracks();
