
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('--- 🛡️ CHRIS-PROTOCOL: ADEMING DATA MIGRATION ---');
  
  // 1. Create Makers
  console.log('Creating makers...');
  const makers = [
    { short_name: 'Julie', full_name: 'Julie', bio: 'Julie brengt een zachte, liefdevolle energie in elke meditatie.', avatar_url: '/assets/ademing/avatar-julie.jpg' },
    { short_name: 'Johfrah', full_name: 'Johfrah', bio: 'Johfrah\'s diepe, rustgevende stem helpt je om direct te landen in het hier en nu.', avatar_url: '/assets/ademing/avatar-johfrah.jpg' }
  ];

  for (const maker of makers) {
    const { data, error } = await supabase
      .from('ademing_makers')
      .upsert(maker, { onConflict: 'short_name' })
      .select()
      .single();
    
    if (error) console.error(`Failed to create maker ${maker.short_name}:`, error.message);
    else console.log(`Maker ${maker.short_name} ready.`);
  }

  // Get maker IDs
  const { data: dbMakers } = await supabase.from('ademing_makers').select('id, short_name');
  const makerMap = Object.fromEntries(dbMakers?.map(m => [m.short_name, m.id]) || []);

  // 2. Create Tracks
  console.log('Creating tracks...');
  const tracks = [
    {
      title: 'Aarde Meditatie 1',
      slug: 'aarde-1',
      url: '/assets/ademing/audio/aarde-1.mp3',
      cover_image_url: '/assets/ademing/cover-aarde.jpg',
      video_background_url: '/assets/ademing/videos/nature-1.mp4',
      element: 'aarde',
      theme: 'rust',
      maker_id: makerMap['Julie'],
      short_description: 'Land in je lichaam en verbind met de kracht van de aarde.',
      is_public: true
    },
    {
      title: 'Aarde Meditatie 2',
      slug: 'aarde-2',
      url: '/assets/ademing/audio/aarde-2.mp3',
      cover_image_url: '/assets/ademing/cover-aarde.jpg',
      video_background_url: '/assets/ademing/videos/nature-2.mp4',
      element: 'aarde',
      theme: 'rust',
      maker_id: makerMap['Johfrah'],
      short_description: 'Een diepe grondingsoefening voor meer stabiliteit.',
      is_public: true
    },
    {
      title: 'Stilte Meditatie',
      slug: 'stiltemeditatie',
      url: '/assets/ademing/audio/stiltemeditatie.mp3',
      cover_image_url: '/assets/ademing/cover-water.jpg',
      video_background_url: '/assets/ademing/videos/nature-3.mp4',
      element: 'water',
      theme: 'rust',
      maker_id: makerMap['Julie'],
      short_description: 'Vind de stilte in jezelf te midden van de chaos.',
      is_public: true
    },
    {
      title: 'Vuur Meditatie 1',
      slug: 'vuur-1',
      url: '/assets/ademing/audio/vuur-1.mp3',
      cover_image_url: '/assets/ademing/cover-vuur.jpg',
      video_background_url: '/assets/ademing/videos/nature-4.mp4',
      element: 'vuur',
      theme: 'energie',
      maker_id: makerMap['Johfrah'],
      short_description: 'Activeer je innerlijke vuur en passie.',
      is_public: true
    }
  ];

  for (const track of tracks) {
    const { error } = await supabase
      .from('ademing_tracks')
      .upsert(track, { onConflict: 'slug' });

    if (error) console.error(`Failed to create track ${track.title}:`, error.message);
    else console.log(`Track ${track.title} ready.`);
  }

  console.log('SUCCESS: Migration complete.');
}

migrateData();
