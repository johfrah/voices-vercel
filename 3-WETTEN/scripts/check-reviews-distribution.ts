#!/usr/bin/env tsx

/**
 * 🛡️ CHRIS-PROTOCOL: Check Reviews Distribution
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReviews() {
  console.log('🔍 Checking reviews distribution...\n');

  // Get count by business_slug
  const { data: distribution, error: distError } = await supabase
    .from('reviews')
    .select('business_slug', { count: 'exact' });

  if (distError) {
    console.error('❌ Error fetching reviews:', distError);
    return;
  }

  // Count manually by business_slug
  const counts: Record<string, number> = {};
  distribution?.forEach((review: any) => {
    counts[review.business_slug] = (counts[review.business_slug] || 0) + 1;
  });

  console.log('📊 Reviews per business_slug:');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([slug, count]) => {
      console.log(`  ${slug}: ${count} reviews`);
    });

  console.log(`\n📈 Total reviews: ${distribution?.length || 0}`);

  // Get sample reviews for voices-be
  const { data: samples, error: sampleError } = await supabase
    .from('reviews')
    .select('author_name, rating, text_nl')
    .eq('business_slug', 'voices-be')
    .limit(3);

  if (sampleError) {
    console.error('❌ Error fetching sample reviews:', sampleError);
    return;
  }

  console.log('\n🎯 Sample reviews for voices-be:');
  samples?.forEach((review: any) => {
    const snippet = review.text_nl?.substring(0, 60) || 'No text';
    console.log(`  - ${review.author_name} (${review.rating}★): ${snippet}...`);
  });
}

checkReviews().then(() => process.exit(0));
