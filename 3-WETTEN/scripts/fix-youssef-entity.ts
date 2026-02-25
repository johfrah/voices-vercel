import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixYoussef() {
  console.log('🚀 Starting Youssef Correction (Actor 2560 -> Artist) via SQL...');

  // 1. Create artists table if it doesn't exist
  console.log('Ensuring artists table exists...');
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        first_name TEXT NOT NULL,
        last_name TEXT,
        display_name TEXT,
        slug TEXT UNIQUE NOT NULL,
        email TEXT,
        gender TEXT,
        native_lang TEXT,
        bio TEXT,
        photo_url TEXT,
        iap_context JSONB,
        status TEXT DEFAULT 'active',
        is_public BOOLEAN DEFAULT true,
        vision TEXT,
        label_manifesto JSONB,
        spotify_url TEXT,
        youtube_url TEXT,
        instagram_url TEXT,
        tiktok_url TEXT,
        donation_goal INTEGER,
        donation_current INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
      );
    `
  });

  if (createError) {
    // Als exec_sql niet bestaat, probeer het dan via een andere weg of meld het
    console.error('❌ Fout bij aanmaken artists tabel (exec_sql niet gevonden?):', createError.message);
    // We gaan toch door, misschien bestaat de tabel al
  } else {
    console.log('✅ artists table ready.');
  }

  // 2. Zoek Youssef in de actors tabel
  const { data: actor } = await supabase
    .from('actors')
    .select('*')
    .or('id.eq.2560,first_name.ilike.Youssef')
    .maybeSingle();

  if (!actor) {
    console.error('❌ Youssef niet gevonden in actors tabel.');
    return;
  }
  console.log(`✅ Youssef gevonden in actors tabel (ID: ${actor.id})`);

  // 3. Voeg Youssef toe aan de artists tabel
  console.log('🏗️ Youssef toevoegen aan de artists tabel...');
  const { error: insertError } = await supabase
    .from('artists')
    .upsert({
      first_name: actor.first_name || 'Youssef',
      last_name: actor.last_name || 'Zaki',
      slug: 'youssef',
      display_name: 'Youssef Zaki',
      bio: actor.bio,
      native_lang: actor.native_lang || 'en-gb',
      status: 'active',
      is_public: true,
      youtube_url: actor.youtube_url,
      photo_url: actor.dropbox_url
    }, { onConflict: 'slug' });

  if (insertError) {
    console.error('❌ Fout bij invoegen in artists tabel:', insertError.message);
  } else {
    console.log('✅ Youssef toegevoegd aan artists tabel.');
  }

  // 4. Verwijder afhankelijkheden en de actor zelf via een SQL block
  console.log('🧹 Opschonen van afhankelijkheden en verwijderen uit actors tabel...');
  const { error: cleanupError } = await supabase.rpc('exec_sql', {
    sql_query: `
      DELETE FROM actor_demos WHERE actor_id = ${actor.id};
      DELETE FROM actor_languages WHERE actor_id = ${actor.id};
      DELETE FROM actor_tones WHERE actor_id = ${actor.id};
      DELETE FROM actor_videos WHERE actor_id = ${actor.id};
      DELETE FROM actors WHERE id = ${actor.id};
    `
  });

  if (cleanupError) {
    console.error('❌ Fout bij opschonen via SQL:', cleanupError.message);
    
    // Probeer het dan maar handmatig per tabel (minder efficiënt maar veiliger als exec_sql faalt)
    await supabase.from('actor_demos').delete().eq('actor_id', actor.id);
    await supabase.from('actor_languages').delete().eq('actor_id', actor.id);
    await supabase.from('actor_tones').delete().eq('actor_id', actor.id);
    await supabase.from('actor_videos').delete().eq('actor_id', actor.id);
    const { error: finalDeleteError } = await supabase.from('actors').delete().eq('id', actor.id);
    
    if (finalDeleteError) {
      console.error('❌ Finale verwijdering uit actors tabel mislukt:', finalDeleteError.message);
    } else {
      console.log('✅ Youssef handmatig verwijderd uit actors tabel.');
    }
  } else {
    console.log('✅ Opschonen en verwijderen voltooid via SQL.');
  }

  console.log('🏁 Youssef is nu officieel een Artist.');
}

fixYoussef();
