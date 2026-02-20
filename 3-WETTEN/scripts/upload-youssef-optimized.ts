
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const VIDEO_PATH = path.join(process.cwd(), '4-KELDER/youssef-crowdfunding-ultrafast.mp4');

async function uploadInChunks() {
  console.log("🚀 STARTING CHUNKED UPLOAD OF OPTIMIZED VIDEO (79MB)");
  
  try {
    const fileBuffer = await fs.readFile(VIDEO_PATH);
    const storagePath = `visuals/youssef/crowdfunding/youssef-crowdfunding.mp4`;

    console.log(`⏳ Uploading to voices/${storagePath} using standard upload...`);

    // We proberen het met een Blob in plaats van Buffer, soms helpt dat met fetch in Node
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });

    const { data, error } = await supabase.storage
      .from('voices')
      .upload(storagePath, blob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) {
      console.error(`   ❌ Upload failed:`, error.message);
      
      if (error.message.includes('fetch failed')) {
        console.log("💡 Tip: Dit lijkt een netwerk/timeout probleem in de lokale omgeving.");
      }
    } else {
      console.log(`   ✅ SUCCESS! Video is live.`);
      console.log(`   🔗 URL: ${supabaseUrl}/storage/v1/object/public/voices/${storagePath}`);
    }
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

uploadInChunks();
