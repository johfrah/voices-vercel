
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSlugs() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING TRACKS SLUG SYNC ---');
  
  const tracks = [
    { id: 1, slug: 'aarde-1' },
    { id: 2, slug: 'aarde-2' },
    { id: 3, slug: 'aarde-dummy' },
    { id: 4, slug: 'stiltemeditatie' },
    { id: 5, slug: 'vuur-1' }
  ];

  for (const track of tracks) {
    const { error } = await supabase
      .from('ademing_tracks')
      .update({ slug: track.slug })
      .eq('id', track.id);

    if (error) {
      console.error(`Failed to update track ${track.id}:`, error);
    } else {
      console.log(`Updated track ${track.id} with slug ${track.slug}`);
    }
  }
}

updateSlugs();
