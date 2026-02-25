import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';

/**
 * 🛡️ CHRIS-PROTOCOL: PHOTO CONSOLIDATION MIGRATION (v2.14.518)
 * 
 * Doel: Forceert "1 Truth" door alle dropbox_url data te verhuizen naar de media tabel
 * en actors.photo_id als enige referentie te behouden.
 */

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Error: Supabase credentials missing.'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log(chalk.cyan.bold('\n🚀 STARTING PHOTO CONSOLIDATION (1 TRUTH)...'));

  // 1. Fetch all actors with any photo data
  const { data: actors, error: fetchError } = await supabase
    .from('actors')
    .select('id, first_name, photo_id, dropbox_url');

  if (fetchError) throw fetchError;

  console.log(chalk.dim(`Found ${actors.length} actors to analyze.\n`));

  for (const actor of actors) {
    const hasId = !!actor.photo_id;
    const hasUrl = !!actor.dropbox_url && actor.dropbox_url.length > 0;

    // SCENARIO A: Alleen dropbox_url -> Maak media record en koppel photo_id
    if (!hasId && hasUrl) {
      console.log(chalk.yellow(`📦 Migrating legacy URL for ${actor.first_name}...`));
      
      let cleanPath = actor.dropbox_url;
      if (cleanPath.includes('/api/proxy/?path=')) {
        cleanPath = decodeURIComponent(cleanPath.split('/api/proxy/?path=')[1]);
      }

      // Check of media record al bestaat voor dit pad
      const { data: existingMedia } = await supabase
        .from('media')
        .select('id')
        .eq('file_path', cleanPath)
        .limit(1)
        .single();

      let mediaId = existingMedia?.id;

      if (!mediaId) {
        const { data: newMedia, error: mediaErr } = await supabase
          .from('media')
          .insert({
            file_name: cleanPath.split('/').pop() || 'photo.webp',
            file_path: cleanPath,
            file_type: 'image/webp',
            journey: 'agency',
            category: 'voices',
            is_public: true,
            labels: ['migrated-from-dropbox-url']
          })
          .select()
          .single();
        
        if (mediaErr) {
          console.error(chalk.red(`   ❌ Failed to create media for ${actor.first_name}: ${mediaErr.message}`));
          continue;
        }
        mediaId = newMedia.id;
      }

      // Koppel aan actor en maak dropbox_url leeg
      const { error: updateErr } = await supabase
        .from('actors')
        .update({ photo_id: mediaId, dropbox_url: "" })
        .eq('id', actor.id);

      if (updateErr) {
        console.error(chalk.red(`   ❌ Failed to update actor ${actor.first_name}: ${updateErr.message}`));
      } else {
        console.log(chalk.green(`   ✅ Linked to media ID ${mediaId}`));
      }
    }

    // SCENARIO B: Beide gevuld -> Maak dropbox_url leeg (photo_id is de Truth)
    else if (hasId && hasUrl) {
      console.log(chalk.blue(`🧹 Cleaning redundant URL for ${actor.first_name}...`));
      await supabase.from('actors').update({ dropbox_url: "" }).eq('id', actor.id);
    }
    
    // SCENARIO C: Alleen photo_id -> Niets doen, is al Nuclear
  }

  console.log(chalk.cyan.bold('\n✨ CONSOLIDATION COMPLETE: 1 TRUTH ESTABLISHED.'));
}

migrate().catch(err => {
  console.error(chalk.red('💥 Migration failed:'), err);
  process.exit(1);
});
