import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the web app
dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function trinityCleanse() {
  console.log('☢️ Starting Trinity Cleanse: ID-First Normalization...');

  // 1. Fetch all actors with legacy fields
  const { data: actors, error: actorsError } = await supabase
    .from('actors')
    .select('id, native_lang, country_id, native_language_id, country_id_new');

  if (actorsError) {
    console.error('❌ Error fetching actors:', actorsError);
    return;
  }

  // 2. Fetch all languages and countries for mapping
  const { data: languages } = await supabase.from('languages').select('id, code, label');
  const { data: countries } = await supabase.from('countries').select('id, code, label');

  const langMap = new Map();
  languages?.forEach(l => {
    langMap.set(l.code.toLowerCase(), l.id);
    langMap.set(l.label.toLowerCase(), l.id);
  });

  const countryMap = new Map();
  countries?.forEach(c => {
    countryMap.set(c.code.toLowerCase(), c.id);
    countryMap.set(c.label.toLowerCase(), c.id);
    countryMap.set(c.id.toString(), c.id); // Also map ID to ID
  });

  console.log(`--- Processing ${actors.length} actors ---`);

  for (const actor of actors) {
    let updates: any = {};

    // Map Language if missing
    if (!actor.native_language_id && actor.native_lang) {
      const langId = langMap.get(actor.native_lang.toLowerCase());
      if (langId) updates.native_language_id = langId;
    }

    // Map Country if missing
    if (!actor.country_id_new && actor.country_id) {
      const countryId = countryMap.get(actor.country_id.toString().toLowerCase());
      if (countryId) updates.country_id_new = countryId;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('actors')
        .update(updates)
        .eq('id', actor.id);

      if (error) console.error(`❌ Error updating actor ${actor.id}:`, error.message);
      else console.log(`✅ Normalized actor ${actor.id}:`, updates);
    }
  }

  console.log('☢️ Trinity Cleanse Completed.');
}

trinityCleanse().catch(console.error);
