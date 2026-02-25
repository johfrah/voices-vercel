import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'zustand';

// 🛡️ CHRIS-PROTOCOL: Nuclear Review Handshake (v2.14.545)
// Doel: Alle 393 review-foto's in de media engine registreren en koppelen.

const SUPABASE_URL = 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function syncReviewsToMedia() {
  console.log('🚀 [REVIEWS-HANDSHAKE] Starting Atomic Synchronization...');

  // 1. Haal alle reviews op
  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('id, author_name, author_photo_url')
    .order('id', { ascending: true });

  if (reviewError || !reviews) {
    console.error('❌ Failed to fetch reviews:', reviewError);
    return;
  }

  console.log(`📦 Found ${reviews.length} reviews to process.`);

  let createdCount = 0;
  let linkedCount = 0;

  for (const review of reviews) {
    const fileName = `author-${review.id}.jpg`;
    const filePath = `reviews/${fileName}`;

    // A. Check of media record al bestaat
    const { data: existingMedia } = await supabase
      .from('media')
      .select('id')
      .eq('file_path', filePath)
      .maybeSingle();

    let mediaId = existingMedia?.id;

    if (!mediaId) {
      // B. Maak media record aan
      const { data: newMedia, error: mediaError } = await supabase
        .from('media')
        .insert({
          file_name: fileName,
          file_path: filePath,
          file_type: 'image/jpeg',
          category: 'reviews',
          journey: 'common',
          alt_text: `Review photo for ${review.author_name}`,
          is_public: true
        })
        .select()
        .single();

      if (mediaError) {
        console.error(`❌ Failed to create media for review ${review.id}:`, mediaError.message);
        continue;
      }
      mediaId = newMedia.id;
      createdCount++;
    }

    // C. Leg de Handshake in de reviews tabel
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ 
        media_id: mediaId,
        // We wissen de URL nog niet in deze stap voor de veiligheid
      })
      .eq('id', review.id);

    if (updateError) {
      console.error(`❌ Failed to link review ${review.id} to media ${mediaId}:`, updateError.message);
    } else {
      linkedCount++;
    }

    if (linkedCount % 50 === 0) {
      console.log(`⏳ Processed ${linkedCount}/${reviews.length} reviews...`);
    }
  }

  console.log(`\n✅ [SYNC COMPLETE]`);
  console.log(`✨ Created ${createdCount} new media records.`);
  console.log(`🔗 Linked ${linkedCount} reviews to the 1 Truth Handshake.`);
}

syncReviewsToMedia().catch(console.error);
