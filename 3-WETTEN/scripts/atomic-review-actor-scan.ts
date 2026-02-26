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

async function main() {
  console.log("--- ATOMIC DATA SCAN: Reviews vs Actors Coverage (V3 - Fuzzy) ---");

  // 1. Get all active actors
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, first_name, last_name, slug')
    .eq('status', 'live')
    .eq('is_public', true);

  if (actorsError) {
    console.error("Error fetching actors:", actorsError);
    return;
  }

  console.log(`Loaded ${actors.length} active actors.`);

  // 2. Get all reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*');

  if (reviewsError) {
    console.error("Error fetching reviews:", reviewsError);
    return;
  }

  console.log(`Loaded ${reviews.length} reviews.`);

  const actorCoverage: Record<string, { name: string, reviews: number[] }> = {};
  actors.forEach(a => {
    actorCoverage[a.id] = { name: `${a.first_name} ${a.last_name}`.trim(), reviews: [] };
  });

  const genericReviews: any[] = [];
  const serviceKeywords = ['service', 'snelheid', 'vriendelijk', 'hulp', 'casting', 'professionaliteit', 'kwaliteit', 'samenwerking', 'bedrijf', 'resultaat'];

  for (const review of reviews) {
    const text = `${review.text_nl || ''} ${review.text_fr || ''} ${review.text_en || ''} ${review.text_de || ''}`.toLowerCase();
    let matchedActor = false;

    // Scan for actor names
    for (const actor of actors) {
      const firstName = actor.first_name?.toLowerCase().trim();
      const lastName = actor.last_name?.toLowerCase().trim();
      
      if (!firstName) continue;

      // Fuzzy matching: name must be present, but doesn't have to be a whole word
      // (e.g. "Johfrah's" or "Johfrah.")
      if (text.includes(firstName)) {
        actorCoverage[actor.id].reviews.push(review.id);
        matchedActor = true;
      } else if (lastName && lastName.length > 3 && text.includes(lastName)) {
        actorCoverage[actor.id].reviews.push(review.id);
        matchedActor = true;
      }
    }

    if (!matchedActor) {
      const isService = serviceKeywords.some(k => text.includes(k));
      if (isService || text.length > 30) {
        genericReviews.push(review);
      }
    }
  }

  // 3. Reporting
  const coveredActors = Object.values(actorCoverage).filter(a => a.reviews.length > 0);
  const uncoveredActors = Object.values(actorCoverage).filter(a => a.reviews.length === 0);

  console.log("\n--- COVERAGE REPORT ---");
  console.log(`Total Active Actors: ${actors.length}`);
  console.log(`Actors with direct review match: ${coveredActors.length} (${((coveredActors.length / actors.length) * 100).toFixed(1)}%)`);
  console.log(`Actors needing Service backup: ${uncoveredActors.length} (${((uncoveredActors.length / actors.length) * 100).toFixed(1)}%)`);
  console.log(`Total Generic 'Service' reviews available: ${genericReviews.length}`);

  console.log("\n--- TOP COVERED ACTORS (Fuzzy) ---");
  coveredActors
    .sort((a, b) => b.reviews.length - a.reviews.length)
    .slice(0, 15)
    .forEach(a => console.log(`${a.name}: ${a.reviews.length} reviews`));

  console.log("\n--- UNCOVERED ACTORS (Sample 10) ---");
  uncoveredActors.slice(0, 10).forEach(a => console.log(`- ${a.name}`));

  console.log("\n--- GENERIC REVIEWS SAMPLES (First 5) ---");
  genericReviews.slice(0, 5).forEach(r => {
    console.log(`ID: ${r.id} | Author: ${r.author_name} | Text: ${r.text_nl?.substring(0, 100)}...`);
  });
}

main().catch(console.error);
