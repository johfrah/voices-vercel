import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const videoFolders = [
  '1-SITE/apps/web/public/assets/content/blog/videos/',
  '1-SITE/apps/web/public/assets/content/blog/videos/academy/'
];

async function syncVideosToSupabase() {
  console.log("🚀 STARTING GLOBAL VIDEO SYNC TO SUPABASE...");

  for (const folder of videoFolders) {
    const files = fs.readdirSync(folder);
    const videoFiles = files.filter(f => f.endsWith('.mp4'));

    for (const file of videoFiles) {
      const localPath = path.join(folder, file);
      const storagePath = `visuals/content/${folder.includes('academy') ? 'academy/' : ''}${file}`;
      
      console.log(`⏳ Checking ${file}...`);
      
      // Check if already exists
      const { data: existing } = await supabase.storage.from('voices').list(path.dirname(storagePath), {
        search: file
      });

      if (existing && existing.length > 0) {
        console.log(`✅ ${file} already exists in Supabase. Skipping.`);
        continue;
      }

      console.log(`📥 Uploading ${file} to Supabase...`);
      const fileBuffer = fs.readFileSync(localPath);
      const blob = new Blob([fileBuffer], { type: 'video/mp4' });

      const { error } = await supabase.storage
        .from('voices')
        .upload(storagePath, blob, {
          contentType: 'video/mp4',
          upsert: true
        });

      if (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
      } else {
        console.log(`✅ Successfully uploaded ${file}`);
      }
    }
  }

  console.log("🏁 GLOBAL VIDEO SYNC COMPLETE.");
}

syncVideosToSupabase().catch(console.error);
