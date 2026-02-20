import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the web app
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '') // Remove tags
    .replace(/&nbsp;/g, ' ')   // Clean entities
    .replace(/\s+/g, ' ')      // Normalize spaces
    .trim();
}

async function cleanupDatabase() {
  console.log('🧹 Starting Nuclear Database Cleanup...');

  // 1. Fetch all actors
  const { data: actors, error } = await supabase
    .from('actors')
    .select('id, first_name, bio, tagline');

  if (error) {
    console.error('❌ Error fetching actors:', error);
    return;
  }

  console.log(`🔍 Found ${actors.length} actors. Checking for HTML slop...`);

  let updatedCount = 0;

  for (const actor of actors) {
    const cleanBio = stripHtml(actor.bio || '');
    const cleanTagline = stripHtml(actor.tagline || '');

    const hasBioSlop = actor.bio !== cleanBio;
    const hasTaglineSlop = actor.tagline !== cleanTagline;

    if (hasBioSlop || hasTaglineSlop) {
      console.log(`✨ Cleaning actor: ${actor.first_name} (ID: ${actor.id})`);
      
      const { error: updateError } = await supabase
        .from('actors')
        .update({
          bio: cleanBio,
          tagline: cleanTagline
        })
        .eq('id', actor.id);

      if (updateError) {
        console.error(`❌ Failed to update actor ${actor.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`\n✅ Cleanup complete!`);
  console.log(`📊 Total actors processed: ${actors.length}`);
  console.log(`🧹 Total actors cleaned: ${updatedCount}`);
}

cleanupDatabase().catch(console.error);
