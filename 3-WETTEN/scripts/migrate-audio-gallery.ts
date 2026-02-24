
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const mdPath = '4-KELDER/VOICE-ACTORS-MATCHING.md';
const BUCKET_NAME = 'voices';

async function main() {
  console.log("🚀 Starting Audio Gallery Migration: Uploading extra demos to Supabase Storage...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  
  let totalUploaded = 0;
  let totalLinked = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    // 1. Extract Supabase ID from header
    const idMatch = section.match(/^(\d+)\]/);
    if (!idMatch) continue;
    const actorId = parseInt(idMatch[1]);

    // 2. Find Audio Gallery section
    const audioGalleryMatch = section.match(/### 🎙️ Audio Gallery\n([\s\S]*?)\n\n###/);
    if (!audioGalleryMatch) continue;
    const audioGalleryContent = audioGalleryMatch[1];

    // 3. Find all demos with local paths
    // Format: - Name: [Online](URL) | **Lokaal**: `PATH`
    const demoLines = audioGalleryContent.split('\n').filter(line => line.includes('**Lokaal**: `'));
    
    if (demoLines.length === 0) continue;

    console.log(`\n🎙️ Processing Audio Gallery for Actor [${actorId}]...`);

    for (const line of demoLines) {
      try {
        const nameMatch = line.match(/^- ([^:]+):/);
        const pathMatch = line.match(/\*\*Lokaal\*\*: `([^`]+)`/);
        
        if (!nameMatch || !pathMatch) continue;
        
        const demoName = nameMatch[1].trim();
        const localPath = pathMatch[1].trim();
        const fullLocalPath = path.resolve(localPath);

        if (!fs.existsSync(fullLocalPath)) {
          console.log(`   ❌ Local file not found: ${localPath}`);
          totalErrors++;
          continue;
        }

        const fileName = path.basename(fullLocalPath);
        const storagePath = `audio-gallery/${actorId}/${fileName}`;

        // A. Upload to Storage
        const fileBuffer = fs.readFileSync(fullLocalPath);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: 'audio/mpeg',
            upsert: true
          });

        if (uploadError) {
          console.error(`   ❌ Failed to upload ${fileName}:`, uploadError.message);
          totalErrors++;
          continue;
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
        totalUploaded++;

        // B. Link in Database (actor_demos)
        // Check if already exists
        const { data: existingDemo } = await supabase
          .from('actor_demos')
          .select('id')
          .eq('actor_id', actorId)
          .eq('url', publicUrl)
          .single();

        if (existingDemo) {
          console.log(`   ℹ️ Demo already linked: ${demoName}`);
          totalSkipped++;
        } else {
          const { error: dbError } = await supabase
            .from('actor_demos')
            .insert({
              actor_id: actorId,
              name: demoName,
              url: publicUrl,
              is_public: true
            });

          if (dbError) {
            console.error(`   ❌ Failed to link ${demoName} in DB:`, dbError.message);
            totalErrors++;
          } else {
            console.log(`   ✅ Success: ${demoName} uploaded and linked.`);
            totalLinked++;
          }
        }
      } catch (err: any) {
        console.error(`   ❌ Unexpected error:`, err.message);
        totalErrors++;
      }
    }
  }

  console.log(`
✨ Migration Finished!
-------------------
📦 Files Uploaded: ${totalUploaded}
🔗 Links Created:  ${totalLinked}
💤 Already Linked: ${totalSkipped}
❌ Errors:         ${totalErrors}
  `);
}

main().catch(console.error);
