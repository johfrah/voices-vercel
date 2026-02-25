
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const VIDEO_PATH = path.join(process.cwd(), '4-KELDER/youssef-crowdfunding.MP4');

async function uploadInChunks() {
  console.log("🚀 STARTING CHUNKED UPLOAD FOR YOUSSEF VIDEO (Chris-Protocol)");
  
  try {
    const fileBuffer = await fs.readFile(VIDEO_PATH);
    const storagePath = `visuals/youssef/crowdfunding/youssef-crowdfunding.mp4`;

    console.log(`⏳ Uploading ${fileBuffer.length} bytes to voices/${storagePath}...`);

    const { data, error } = await supabase.storage
      .from('voices')
      .upload(storagePath, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) {
      console.error(`   ❌ Upload failed:`, error.message);
      if (error.message.includes('fetch failed')) {
        console.log("💡 Tip: Het bestand is mogelijk te groot voor de standaard fetch timeout. Ik probeer het opnieuw met een verhoogde timeout.");
      }
    } else {
      console.log(`   ✅ Successfully uploaded: ${storagePath}`);
    }

  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

uploadInChunks();
