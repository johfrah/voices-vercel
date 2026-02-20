
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const VOICE_CARDS_DIR = path.join(process.cwd(), '1-SITE/assets/visuals/active/voicecards');

async function syncToSupabase() {
  console.log("🚀 STARTING SUPABASE STORAGE SYNC (WebP Assets)");
  
  try {
    const files = await fs.readdir(VOICE_CARDS_DIR);
    const webpFiles = files.filter(f => f.endsWith('.webp'));
    
    console.log(`📸 Found ${webpFiles.length} WebP files to upload.`);

    for (const file of webpFiles) {
      const filePath = path.join(VOICE_CARDS_DIR, file);
      const fileBuffer = await fs.readFile(filePath);
      const storagePath = `visuals/active/voicecards/${file}`;

      console.log(`⏳ Uploading: ${file} -> Supabase Storage`);

      const { data, error } = await supabase.storage
        .from('voices')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        console.error(`   ❌ Upload failed for ${file}:`, error.message);
      } else {
        console.log(`   ✅ Successfully synced: ${file}`);
      }
    }

    console.log("✅ SUPABASE STORAGE SYNC COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

syncToSupabase();
