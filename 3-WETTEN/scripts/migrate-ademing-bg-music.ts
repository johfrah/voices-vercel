
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateBackgroundMusic() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING BACKGROUND MUSIC MIGRATION ---');
  
  const music = [
    { title: 'Aarde Achtergrond', url: '/assets/ademing/audio/background/aarde.mp3', element: 'aarde' },
    { title: 'Water Achtergrond', url: '/assets/ademing/audio/background/water.mp3', element: 'water' },
    { title: 'Lucht Achtergrond', url: '/assets/ademing/audio/background/lucht.mp3', element: 'lucht' },
    { title: 'Vuur Achtergrond', url: '/assets/ademing/audio/background/vuur.mp3', element: 'vuur' }
  ];

  for (const item of music) {
    const { error } = await supabase
      .from('ademing_background_music')
      .upsert(item, { onConflict: 'title' });

    if (error) console.error(`Failed to create music ${item.title}:`, error.message);
    else console.log(`Music ${item.title} ready.`);
  }

  console.log('SUCCESS: Background music migration complete.');
}

migrateBackgroundMusic();
