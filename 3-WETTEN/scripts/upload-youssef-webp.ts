
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

const GALLERY_DIR = path.join(process.cwd(), '4-KELDER/gallery');

async function convertAndUploadYoussef() {
  console.log("🚀 STARTING YOUSSEF WEBP CONVERSION & UPLOAD (Chris-Protocol)");
  
  try {
    const files = await fs.readdir(GALLERY_DIR);
    const youssefFiles = files.filter(f => f.startsWith('Youssef-Zaki-') && f.endsWith('.jpg'));
    
    console.log(`📸 Found ${youssefFiles.length} Youssef JPG files to convert.`);

    for (const file of youssefFiles) {
      const filePath = path.join(GALLERY_DIR, file);
      const webpFileName = file.replace('.jpg', '.webp');
      
      console.log(`⏳ Converting: ${file} -> ${webpFileName}`);
      
      const webpBuffer = await sharp(filePath)
        .webp({ quality: 85 })
        .toBuffer();

      const storagePath = `2026/01/${webpFileName}`;

      console.log(`⏳ Uploading: ${webpFileName} -> voices/2026/01/`);

      const { data, error } = await supabase.storage
        .from('voices')
        .upload(storagePath, webpBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) {
        console.error(`   ❌ Upload failed for ${webpFileName}:`, error.message);
      } else {
        console.log(`   ✅ Successfully uploaded: ${webpFileName}`);
      }
    }

    console.log("✅ YOUSSEF WEBP CONVERSION & UPLOAD COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

convertAndUploadYoussef();
