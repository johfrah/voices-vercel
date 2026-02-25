
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

async function uploadCrowdfundingVideo() {
  console.log("🚀 STARTING YOUSSEF CROWDFUNDING VIDEO UPLOAD (Chris-Protocol)");
  
  try {
    const fileBuffer = await fs.readFile(VIDEO_PATH);
    const storagePath = `visuals/youssef/crowdfunding/youssef-crowdfunding.mp4`;

    console.log(`⏳ Uploading: youssef-crowdfunding.MP4 -> voices/${storagePath}`);

    const { data, error } = await supabase.storage
      .from('voices')
      .upload(storagePath, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) {
      console.error(`   ❌ Upload failed:`, error.message);
    } else {
      console.log(`   ✅ Successfully uploaded crowdfunding video.`);
    }

    console.log("✅ YOUSSEF CROWDFUNDING VIDEO UPLOAD COMPLETE.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

uploadCrowdfundingVideo();
