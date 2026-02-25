import { createClient } from '@supabase/supabase-js';

// 🛡️ CHRIS-PROTOCOL: Nuclear Review Path Update (v2.14.546)
// Doel: Alle reviews omzetten naar interne storage paden in author_photo_url.

const SUPABASE_URL = 'https://vcbxyyjsxuquytcsskpj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function updateReviewPaths() {
  console.log('🚀 [REVIEWS-PATH-UPDATE] Starting Atomic Path Update...');

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

  let updatedCount = 0;

  for (const review of reviews) {
    // Sla over als het al een intern pad is
    if (review.author_photo_url?.startsWith('reviews/')) {
      continue;
    }

    const internalPath = `reviews/author-${review.id}.jpg`;

    // Update de author_photo_url naar het interne pad
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ 
        author_photo_url: internalPath
      })
      .eq('id', review.id);

    if (updateError) {
      console.error(`❌ Failed to update path for review ${review.id}:`, updateError.message);
    } else {
      updatedCount++;
    }

    if (updatedCount % 50 === 0) {
      console.log(`⏳ Updated ${updatedCount}/${reviews.length} paths...`);
    }
  }

  console.log(`\n✅ [UPDATE COMPLETE]`);
  console.log(`✨ Updated ${updatedCount} review photo paths to internal storage.`);
}

updateReviewPaths().catch(console.error);
