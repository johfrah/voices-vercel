
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const GALLERY_DIR = path.join(process.cwd(), '4-KELDER/gallery');

async function uploadYoussefAssets() {
  console.log("🚀 STARTING YOUSSEF ASSETS UPLOAD (Chris-Protocol)");
  
  try {
    const files = await fs.readdir(GALLERY_DIR);
    // We pakken de JPG bestanden die we nodig hebben voor de gallery
    const youssefFiles = files.filter(f => f.startsWith('Youssef-Zaki-') && f.endsWith('.jpg'));
    
    console.log(`📸 Found ${youssefFiles.length} Youssef JPG files to upload.`);

    for (const file of youssefFiles) {
      const filePath = path.join(GALLERY_DIR, file);
      const fileBuffer = await fs.readFile(filePath);
      const storagePath = `2026/01/${file}`;

      console.log(`⏳ Uploading: ${file} -> voices/2026/01/`);

      const { data, error } = await supabase.storage
        .from('voices')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error(`   ❌ Upload failed for ${file}:`, error.message);
      } else {
        console.log(`   ✅ Successfully uploaded: ${file}`);
      }
    }

    console.log("✅ YOUSSEF ASSETS UPLOAD COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

uploadYoussefAssets();
