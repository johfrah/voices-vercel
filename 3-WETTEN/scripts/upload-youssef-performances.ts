
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const filesToUpload = [
  {
    local: '4-KELDER/youssef-the-voice-audition.mp4',
    remote: 'visuals/youssef/performances/fix-you.mp4'
  },
  {
    local: '4-KELDER/youssef-the-voice-battle.mp4',
    remote: 'visuals/youssef/performances/battle-the-voice.mp4'
  }
];

async function uploadPerformances() {
  console.log("🚀 STARTING UPLOAD OF YOUSSEF PERFORMANCES TO SUPABASE...");

  for (const file of filesToUpload) {
    if (!fs.existsSync(file.local)) {
      console.error(`❌ File not found: ${file.local}`);
      continue;
    }

    console.log(`📥 Uploading ${file.local} to voices/${file.remote}...`);
    const fileBuffer = fs.readFileSync(file.local);
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });

    const { data, error } = await supabase.storage
      .from('voices')
      .upload(file.remote, blob, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) {
      console.error(`❌ Failed to upload ${file.local}:`, error.message);
    } else {
      console.log(`✅ Successfully uploaded ${file.local}`);
      console.log(`🔗 URL: ${supabaseUrl}/storage/v1/object/public/voices/${file.remote}`);
    }
  }

  console.log("🏁 UPLOAD COMPLETE.");
}

uploadPerformances().catch(console.error);
