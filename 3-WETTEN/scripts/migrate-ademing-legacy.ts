import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { db, ademingTracks, ademingMakers, ademingSeries, ademingBackgroundMusic, media } from '../1-SITE/apps/web/src/lib/system/voices-config.js';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'voices';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CELLAR_PATH = path.resolve(__dirname, '../../4-KELDER/ademing-main');
const ASSETS_TARGET_PATH = path.resolve(__dirname, '../../1-SITE/assets/ademing');

async function migrate() {
  console.log('🚀 Starting Ademing Migration...');

  // 1. Ensure target directory exists
  if (!fs.existsSync(ASSETS_TARGET_PATH)) {
    fs.mkdirSync(ASSETS_TARGET_PATH, { recursive: true });
  }

  // 2. Migrate Makers
  console.log('👥 Migrating Makers...');
  const makers = [
    {
      short_name: 'Julie',
      full_name: 'Julie Claassens',
      bio: 'Julie Claassens is oprichter van Wild Awake en gespecialiseerd in embodied living en yogatherapie...',
      website: 'https://wildawake.be',
      instagram: '@wildawake.be',
      avatar_local: 'src/assets/avatar-julie.jpg',
      hero_local: 'src/assets/hero-julie.jpg'
    },
    {
      short_name: 'Johfrah',
      full_name: 'Johfrah Lefebvre',
      bio: 'Johfrah Lefebvre is een verhalenverteller en televisiemaker met een diepe verwondering voor de mens...',
      website: 'https://johfrah.be',
      instagram: '@johfrah',
      avatar_local: 'src/assets/johfrah-portrait.jpg',
      hero_local: 'src/assets/johfrah-outdoor.jpg'
    }
  ];

  for (const maker of makers) {
    const avatarPath = await syncAsset(maker.avatar_local, `makers/${maker.short_name.toLowerCase()}-avatar.jpg`);
    const heroPath = await syncAsset(maker.hero_local, `makers/${maker.short_name.toLowerCase()}-hero.jpg`);
    
    await db.insert(ademingMakers).values({
      short_name: maker.short_name,
      full_name: maker.full_name,
      bio: maker.bio,
      website: maker.website,
      instagram: maker.instagram,
      avatar_url: avatarPath,
      hero_image_url: heroPath,
    }).onConflictDoUpdate({
      target: ademingMakers.short_name,
      set: { bio: maker.bio, avatar_url: avatarPath, hero_image_url: heroPath }
    });
  }

  // 3. Migrate Background Music
  console.log('🎵 Migrating Background Music...');
  const bgMusic = [
    { element: 'aarde', local: 'public/audio/background/aarde.mp3' },
    { element: 'water', local: 'public/audio/background/water.mp3' },
    { element: 'lucht', local: 'public/audio/background/lucht.mp3' },
    { element: 'vuur', local: 'public/audio/background/vuur.mp3' },
  ];

  for (const bg of bgMusic) {
    const audioPath = await syncAsset(bg.local, `audio/background/${bg.element}.mp3`);
    await db.insert(ademingBackgroundMusic).values({
      element: bg.element,
      audio_url: audioPath,
    });
  }

  // 4. Migrate Tracks (Sample)
  console.log('🎧 Migrating Sample Tracks...');
  const sampleTracks = [
    {
      title: 'Aarde Meditatie 1',
      slug: 'aarde-meditatie-1',
      element: 'aarde',
      theme: 'rust',
      maker: 'Julie',
      audio_local: 'public/audio/aarde-1.mp3',
      cover_local: 'src/assets/cover-aarde.jpg'
    }
  ];

  for (const track of sampleTracks) {
    const audioPath = await syncAsset(track.audio_local, `audio/tracks/${track.slug}.mp3`);
    const coverPath = await syncAsset(track.cover_local, `covers/${track.slug}.jpg`);
    
    const [maker] = await db.select().from(ademingMakers).where(eq(ademingMakers.short_name, track.maker));

    await db.insert(ademingTracks).values({
      title: track.title,
      slug: track.slug,
      element: track.element,
      theme: track.theme,
      makerId: maker?.id,
      url: audioPath,
      cover_image_url: coverPath,
    }).onConflictDoUpdate({
      target: ademingTracks.slug,
      set: { title: track.title, url: audioPath, cover_image_url: coverPath }
    });
  }

  console.log('✅ Ademing Migration Completed!');
}

async function syncAsset(localRelativePath: string, targetRelativePath: string) {
  const sourcePath = path.join(CELLAR_PATH, localRelativePath);
  const targetPath = path.join(ASSETS_TARGET_PATH, targetRelativePath);
  const targetDir = path.dirname(targetPath);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Synced: ${localRelativePath} -> ${targetRelativePath}`);
    
    // Upload to Supabase
    const fileContent = fs.readFileSync(targetPath);
    const supabasePath = `ademing/${targetRelativePath}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(supabasePath, fileContent, { upsert: true });

    if (error) console.error(`Supabase upload error for ${supabasePath}:`, error.message);
    
    return `/assets/ademing/${targetRelativePath}`;
  }
  return '';
}

migrate().catch(console.error);
