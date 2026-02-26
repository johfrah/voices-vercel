import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from 1-SITE/apps/web/.env.local
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function scanReviews() {
  console.log("--- ATOMIC DATA SCAN: Reviews Journey Mapping ---");

  const { data: allReviews, error } = await supabase
    .from('reviews')
    .select('*');

  if (error) {
    console.error("Error fetching reviews:", error);
    return;
  }

  console.log(`Total reviews found: ${allReviews.length}`);

  const mappings: Record<string, number[]> = {
    telephony: [],
    commercial: [],
    video_corporate: [],
    service: [],
    academy: [],
    unmapped: []
  };

  const keywords = {
    telephony: ['telefoon', 'centrale', 'ivr', 'wachtmuziek', 'voicemail', 'telephony'],
    commercial: ['reclame', 'spot', 'radio', 'tv', 'commercial', 'campagne'],
    video_corporate: ['video', 'bedrijfsfilm', 'explainer', 'e-learning', 'documentaire'],
    service: ['service', 'snelheid', 'vriendelijk', 'hulp', 'casting'],
    academy: ['workshop', 'cursus', 'lesgever', 'bernadette', 'beginners', 'vakmanschap']
  };

  for (const review of allReviews) {
    const text = `${review.text_nl || ''} ${review.text_fr || ''} ${review.text_en || ''}`.toLowerCase();
    let mapped = false;

    // Check keywords
    for (const [journey, keys] of Object.entries(keywords)) {
      if (keys.some(k => text.includes(k))) {
        mappings[journey].push(review.id);
        mapped = true;
      }
    }

    if (!mapped) {
      mappings.unmapped.push(review.id);
    }
  }

  console.log("\n--- Results ---");
  console.log(`Telephony: ${mappings.telephony.length}`);
  console.log(`Commercial: ${mappings.commercial.length}`);
  console.log(`Video/Corporate: ${mappings.video_corporate.length}`);
  console.log(`Service: ${mappings.service.length}`);
  console.log(`Academy: ${mappings.academy.length}`);
  console.log(`Unmapped: ${mappings.unmapped.length}`);

  // Deep dive into unmapped samples
  if (mappings.unmapped.length > 0) {
      console.log("\n--- Unmapped Samples (First 15) ---");
      const samples = allReviews.filter(r => mappings.unmapped.slice(0, 15).includes(r.id));
      samples.forEach(s => {
          console.log(`ID: ${s.id} | Author: ${s.author_name} | Text: ${s.text_nl?.substring(0, 120)}...`);
      });
  }
}

scanReviews().catch(console.error);
