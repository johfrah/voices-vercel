import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const INVENTORY_FILE = 'local_demo_inventory.txt';
const BUCKET_NAME = 'voices';

async function processDemosAtomic() {
  console.log('🚀 Starting Atomic Demo Upload & Link Pipeline...');

  if (!fs.existsSync(INVENTORY_FILE)) {
    console.error('❌ Inventory file not found. Run find command first.');
    return;
  }

  const files = fs.readFileSync(INVENTORY_FILE, 'utf-8').split('\n').filter(Boolean);
  console.log(`📂 Found ${files.length} files to process.`);

  // 1. Get all actors to map WP ID to DB ID
  const { data: actors, error: actorError } = await supabase
    .from('actors')
    .select('id, wp_product_id, first_name, last_name');

  if (actorError) {
    console.error('❌ Failed to fetch actors:', actorError);
    return;
  }

  const actorMap = new Map();
  actors.forEach(a => {
    if (a.wp_product_id) actorMap.set(a.wp_product_id.toString(), a);
  });

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const filePath of files) {
    try {
      // Extract WP ID from path (e.g., .../bartek-A-251524/...)
      const match = filePath.match(/-A-(\d+)/);
      if (!match) {
        console.log(`⚠️ Could not extract WP ID from path: ${filePath}`);
        skippedCount++;
        continue;
      }

      const wpId = match[1];
      const actor = actorMap.get(wpId);

      if (!actor) {
        console.log(`⚠️ No actor found in DB for WP ID: ${wpId} (Path: ${filePath})`);
        skippedCount++;
        continue;
      }

      const fileName = path.basename(filePath);
      const storagePath = filePath.replace('1-SITE/assets/', ''); // Keep structure in bucket
      
      // Determine type and title from filename
      let type = 'demo';
      if (fileName.toLowerCase().includes('telefonie') || fileName.toLowerCase().includes('telephony') || fileName.toLowerCase().includes('ivr')) {
        type = 'telephony';
      } else if (fileName.toLowerCase().includes('commercial') || fileName.toLowerCase().includes('reclame')) {
        type = 'commercial';
      } else if (fileName.toLowerCase().includes('corporate') || fileName.toLowerCase().includes('bedrijfs')) {
        type = 'video';
      }

      // Clean title
      let title = fileName
        .replace(/\.mp3$/i, '')
        .replace(new RegExp(`.*-A-${wpId}-`, 'i'), '')
        .replace(/-/g, ' ')
        .trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);

      // 2. Upload to Supabase Storage
      const fileBuffer = fs.readFileSync(filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) {
        console.error(`❌ Failed to upload ${fileName}:`, uploadError);
        errorCount++;
        continue;
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;

      // 3. Create/Update link in actor_demos
      // Check if this URL already exists for this actor to avoid duplicates
      const { data: existingDemo } = await supabase
        .from('actor_demos')
        .select('id')
        .eq('actor_id', actor.id)
        .eq('url', publicUrl)
        .single();

      if (existingDemo) {
        console.log(`ℹ️ Demo already linked: ${fileName} for ${actor.first_name}`);
        skippedCount++;
      } else {
        const { error: dbError } = await supabase
          .from('actor_demos')
          .insert({
            actor_id: actor.id,
            name: title,
            url: publicUrl,
            type: type,
            is_public: true
          });

        if (dbError) {
          console.error(`❌ Failed to link ${fileName} in DB:`, dbError);
          errorCount++;
        } else {
          console.log(`✅ Processed: ${fileName} -> ${actor.first_name} (${type})`);
          successCount++;
        }
      }

    } catch (err) {
      console.error(`❌ Unexpected error processing ${filePath}:`, err);
      errorCount++;
    }
  }

  console.log(`
✨ Pipeline Finished!
-------------------
✅ Success: ${successCount}
⚠️ Skipped: ${skippedCount}
❌ Errors:  ${errorCount}
  `);
}

processDemosAtomic().catch(console.error);
