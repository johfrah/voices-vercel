import { db } from '../../1-SITE/apps/web/src/lib/sync/bridge';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('🚀 Starting Comprehensive Relational Migration (Drizzle Script)...');

  try {
    // 1. Create Enums and Tables via SQL
    console.log('Updating schema...');
    await db.execute(sql`
      -- Enums
      DO $$ BEGIN
        CREATE TYPE gender AS ENUM ('male', 'female', 'non-binary');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE experience_level AS ENUM ('junior', 'pro', 'senior', 'legend');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Tables
      CREATE TABLE IF NOT EXISTS languages (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        is_popular BOOLEAN DEFAULT false,
        is_native_only BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS voice_tones (
        id SERIAL PRIMARY KEY,
        label TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS actor_languages (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
        language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
        is_native BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(actor_id, language_id)
      );

      CREATE TABLE IF NOT EXISTS actor_tones (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
        tone_id INTEGER REFERENCES voice_tones(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(actor_id, tone_id)
      );

      -- Alter actors table
      ALTER TABLE actors 
        ADD COLUMN IF NOT EXISTS gender_new gender,
        ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
        ADD COLUMN IF NOT EXISTS experience_level_new experience_level DEFAULT 'pro';
    `);
    console.log('✅ Schema updated');

    // 2. Seed Reference Data
    console.log('Seeding reference data...');
    
    const languages = [
      { code: 'nl-be', label: 'Vlaams', is_native_only: true, is_popular: true },
      { code: 'nl-nl', label: 'Nederlands', is_popular: true },
      { code: 'fr-fr', label: 'Frans', is_popular: true },
      { code: 'fr-be', label: 'Frans (BE)', is_popular: true },
      { code: 'en-gb', label: 'Engels', is_popular: true },
      { code: 'en-us', label: 'Engels (US)', is_popular: true },
      { code: 'de-de', label: 'Duits', is_popular: true },
      { code: 'es-es', label: 'Spaans', is_popular: true },
      { code: 'it-it', label: 'Italiaans', is_popular: true },
      { code: 'pt-pt', label: 'Portugees', is_popular: true }
    ];

    for (const lang of languages) {
      await db.execute(sql`
        INSERT INTO languages (code, label, is_popular, is_native_only)
        VALUES (${lang.code}, ${lang.label}, ${lang.is_popular || false}, ${lang.is_native_only || false})
        ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, is_popular = EXCLUDED.is_popular, is_native_only = EXCLUDED.is_native_only
      `);
    }

    const countries = [
      { code: 'BE', label: 'België' },
      { code: 'NL', label: 'Nederland' },
      { code: 'FR', label: 'Frankrijk' },
      { code: 'DE', label: 'Duitsland' },
      { code: 'UK', label: 'United Kingdom' },
      { code: 'US', label: 'United States' },
      { code: 'ES', label: 'Spanje' },
      { code: 'IT', label: 'Italië' },
      { code: 'PT', label: 'Portugal' }
    ];

    for (const c of countries) {
      await db.execute(sql`
        INSERT INTO countries (code, label)
        VALUES (${c.code}, ${c.label})
        ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label
      `);
    }
    console.log('✅ Reference data seeded');

    // 3. Migrate Actors
    console.log('Migrating actor data...');
    const actorsResult = await db.execute(sql`SELECT * FROM actors`);
    const langsResult = await db.execute(sql`SELECT * FROM languages`);
    const countriesResult = await db.execute(sql`SELECT * FROM countries`);

    const dbActors = (actorsResult.rows || actorsResult) as any[];
    const dbLangs = (langsResult.rows || langsResult) as any[];
    const dbCountries = (countriesResult.rows || countriesResult) as any[];

    for (const actor of dbActors) {
      // Gender mapping
      let genderVal: string | null = null;
      const g = (actor.gender || '').toLowerCase();
      if (g.includes('man') || g === 'male') genderVal = 'male';
      else if (g.includes('vrouw') || g === 'female') genderVal = 'female';

      // Country mapping
      const countryMatch = dbCountries.find((c: any) => c.code === actor.country?.toUpperCase());
      
      // Update actor
      await db.execute(sql`
        UPDATE actors 
        SET gender_new = ${genderVal as any}, 
            country_id = ${countryMatch?.id || null},
            experience_level_new = ${(actor.experience_level === 'senior' || actor.experience_level === 'legend') ? actor.experience_level : 'pro'}
        WHERE id = ${actor.id}
      `);

      // Language relations
      const nativeCode = actor.native_lang?.toLowerCase() === 'vlaams' ? 'nl-be' : 
                         actor.native_lang?.toLowerCase() === 'nederlands' ? 'nl-nl' : 
                         actor.native_lang?.toLowerCase();
      const nativeLang = dbLangs.find((l: any) => l.code === nativeCode || l.label.toLowerCase() === nativeCode);
      if (nativeLang) {
        await db.execute(sql`
          INSERT INTO actor_languages (actor_id, language_id, is_native)
          VALUES (${actor.id}, ${nativeLang.id}, true)
          ON CONFLICT (actor_id, language_id) DO UPDATE SET is_native = true
        `);
      }

      // Tone relations
      if (actor.tone_of_voice) {
        const tones = actor.tone_of_voice.split(',').map((t: string) => t.trim());
        for (const toneLabel of tones) {
          if (!toneLabel) continue;
          
          // Upsert tone and get ID
          await db.execute(sql`
            INSERT INTO voice_tones (label) VALUES (${toneLabel})
            ON CONFLICT (label) DO NOTHING
          `);
          
          const toneResult = await db.execute(sql`SELECT id FROM voice_tones WHERE label = ${toneLabel}`);
          const dbTone = (toneResult.rows || toneResult) as any[];
          const toneId = dbTone[0]?.id;

          if (toneId) {
            await db.execute(sql`
              INSERT INTO actor_tones (actor_id, tone_id)
              VALUES (${actor.id}, ${toneId})
              ON CONFLICT (actor_id, tone_id) DO NOTHING
            `);
          }
        }
      }
    }

    console.log('✅ Comprehensive migration completed.');
    
    // Final verification
    const tResult = await db.execute(sql`SELECT count(*) FROM voice_tones`);
    const alResult = await db.execute(sql`SELECT count(*) FROM actor_languages`);
    const aResult = await db.execute(sql`SELECT count(*) FROM actors WHERE gender_new IS NOT NULL`);
    
    const t = (tResult.rows || tResult) as any[];
    const al = (alResult.rows || alResult) as any[];
    const a = (aResult.rows || aResult) as any[];

    console.log('--- VERIFICATION ---');
    console.log('Voice Tones:', t[0].count);
    console.log('Actor Languages:', al[0].count);
    console.log('Actors with Gender Enum:', a[0].count);
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrate();
