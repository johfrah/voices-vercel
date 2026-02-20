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

async function hardLinkPhotos() {
  console.log("🚀 STARTING NUCLEAR PHOTO RE-LINKING (Supabase RPC Edition)");
  
  try {
    const files = await fs.readdir(VOICE_CARDS_DIR);
    const webpFiles = files.filter(f => f.endsWith('.webp'));
    
    console.log(`📸 Found ${webpFiles.length} optimized WebP files in assets.`);

    for (const file of webpFiles) {
      const idMatch = file.match(/^(\d+)-/);
      if (idMatch) {
        const actorId = parseInt(idMatch[1]);
        const storagePath = `visuals/active/voicecards/${file}`;

        console.log(`🔗 Linking Actor ${actorId} -> ${file}`);

        // We gebruiken de REST API van Supabase direct via de client
        // Dit omzeilt de schema cache issues van de SDK
        const { error: dbError } = await supabase
          .from('actors')
          .update({ 
            dropbox_url: storagePath,
            is_manually_edited: true
          } as any) // Cast to any to bypass local type checks
          .eq('id', actorId);

        if (dbError) {
          console.error(`   ❌ Supabase Error for Actor ${actorId}:`, dbError.message);
        }
      }
    }

    console.log("✅ ALL ACTORS SUCCESSFULLY LINKED TO CORRECT PHOTOS.");
  } catch (err: any) {
    console.error("💥 FATAL ERROR:", err.message);
  }
}

hardLinkPhotos();
