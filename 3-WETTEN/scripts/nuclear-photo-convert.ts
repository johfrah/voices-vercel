import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const VOICE_CARDS_DIR = path.join(process.cwd(), '1-SITE/assets/visuals/active/voicecards');
const ARCHIVE_DIR = path.join(process.cwd(), '4-KELDER/ARCHIVE/legacy-photos');

async function convertPhotos() {
  console.log("🚀 STARTING NUCLEAR PHOTO CONVERSION (WebP + ID-First)");
  
  try {
    await fs.mkdir(ARCHIVE_DIR, { recursive: true });
    const files = await fs.readdir(VOICE_CARDS_DIR);
    const imageFiles = files.filter(f => f.match(/\.(webp)$/i));
    
    console.log(`📸 Found ${imageFiles.length} WebP images to sync with DB.`);

    for (const file of imageFiles) {
      const idMatch = file.match(/^(\d+)-/);
      if (idMatch) {
        const actorId = parseInt(idMatch[1]);
        const newUrl = `visuals/active/voicecards/${file}`;
        
        console.log(`   🔗 Syncing DB for Actor ID ${actorId}: ${newUrl}`);
        
        const { error: dbError } = await supabase
          .from('actors')
          .update({ dropbox_url: newUrl })
          .eq('id', actorId);

        if (dbError) console.error(`   ❌ DB Error for ID ${actorId}:`, dbError.message);
      }
    }

    console.log("✅ NUCLEAR CONVERSION COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

convertPhotos();
