import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the web app
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function nuclearCleanse() {
  console.log('☢️ Starting Nuclear Cleanse & Slug Registry Sync...');

  // 1. Sync Actors to Slug Registry
  console.log('--- Syncing Actors ---');
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, slug, first_name, last_name, status, is_public')
    .eq('status', 'live')
    .eq('is_public', true);

  if (actorsError) {
    console.error('❌ Error fetching actors:', actorsError);
  } else {
    for (const actor of actors) {
      const actorSlug = actor.slug || `${actor.first_name?.toLowerCase()}-${actor.last_name?.toLowerCase()}`;
      if (!actorSlug) continue;

      const { error: regError } = await supabase
        .from('slug_registry')
        .upsert({
          slug: actorSlug,
          routing_type: 'actor',
          entity_id: actor.id,
          journey: 'agency',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });

      if (regError) console.error(`❌ Error registry sync for actor ${actor.id}:`, regError.message);
      else console.log(`✅ Registered actor: ${actorSlug} (ID: ${actor.id})`);
    }
  }

  // 2. Sync Languages to Slug Registry (Category Pages)
  console.log('--- Syncing Languages (Categories) ---');
  const { data: languages, error: langError } = await supabase
    .from('languages')
    .select('id, code, label');

  if (langError) {
    console.error('❌ Error fetching languages:', langError);
  } else {
    for (const lang of languages) {
      // Use code as slug for now (e.g., 'nl-BE', 'en-GB')
      const langSlug = lang.code.toLowerCase();

      const { error: regError } = await supabase
        .from('slug_registry')
        .upsert({
          slug: langSlug,
          routing_type: 'language',
          entity_id: lang.id,
          journey: 'agency',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });

      if (regError) console.error(`❌ Error registry sync for language ${lang.id}:`, regError.message);
      else console.log(`✅ Registered language category: ${langSlug} (ID: ${lang.id})`);
    }
  }

  // 3. Sync Countries to Slug Registry (Category Pages)
  console.log('--- Syncing Countries (Categories) ---');
  const { data: countries, error: countryError } = await supabase
    .from('countries')
    .select('id, code, label');

  if (countryError) {
    console.error('❌ Error fetching countries:', countryError);
  } else {
    for (const country of countries) {
      const countrySlug = country.code.toLowerCase();

      const { error: regError } = await supabase
        .from('slug_registry')
        .upsert({
          slug: countrySlug,
          routing_type: 'country',
          entity_id: country.id,
          journey: 'agency',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });

      if (regError) console.error(`❌ Error registry sync for country ${country.id}:`, regError.message);
      else console.log(`✅ Registered country category: ${countrySlug} (ID: ${country.id})`);
    }
  }

  // 4. Sync Attributes to Slug Registry (Category Pages)
  console.log('--- Syncing Attributes (Categories) ---');
  const { data: attributes, error: attrError } = await supabase
    .from('actor_attributes')
    .select('id, code, label');

  if (attrError) {
    console.error('❌ Error fetching attributes:', attrError);
  } else {
    for (const attr of attributes) {
      const attrSlug = attr.code.toLowerCase();

      const { error: regError } = await supabase
        .from('slug_registry')
        .upsert({
          slug: attrSlug,
          routing_type: 'attribute',
          entity_id: attr.id,
          journey: 'agency',
          market_code: 'ALL',
          is_active: true
        }, { onConflict: 'slug, market_code, journey' });

      if (regError) console.error(`❌ Error registry sync for attribute ${attr.id}:`, regError.message);
      else console.log(`✅ Registered attribute category: ${attrSlug} (ID: ${attr.id})`);
    }
  }

  console.log('☢️ Nuclear Cleanse & Sync Completed.');
}

nuclearCleanse().catch(console.error);
