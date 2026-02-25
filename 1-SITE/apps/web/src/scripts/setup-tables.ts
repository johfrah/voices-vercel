import { db } from '@/lib/system/voices-config';
import { sql } from 'drizzle-orm';

async function setupTables() {
  console.log('🚀 STARTING NUCLEAR TABLE SETUP (Handshake Truth 2026)\n');

  try {
    // 1. Create Genders Table
    console.log('🚻 Creating genders table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS genders (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Create Journeys Table
    console.log('🛤️ Creating journeys table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS journeys (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Create Media Types Table
    console.log('📺 Creating media_types table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS media_types (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        has_regions BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 4. Seed Genders
    console.log('🌱 Seeding genders...');
    await db.execute(sql`
      INSERT INTO genders (code, label)
      VALUES 
        ('male', 'Mannelijk'),
        ('female', 'Vrouwelijk'),
        ('non-binary', 'Non-binair'),
        ('boy', 'Jongen'),
        ('girl', 'Meisje')
      ON CONFLICT (code) DO NOTHING
    `);

    // 5. Seed Journeys
    console.log('🌱 Seeding journeys...');
    await db.execute(sql`
      INSERT INTO journeys (code, label, description)
      VALUES 
        ('telephony', 'Telefonie', 'Voicemail & IVR'),
        ('video', 'Video', 'Corporate & Website'),
        ('commercial', 'Advertentie', 'Radio, TV & Online Ads'),
        ('studio', 'Voices Studio', 'Workshops & Training'),
        ('academy', 'Voices Academy', 'Online Learning')
      ON CONFLICT (code) DO NOTHING
    `);

    // 6. Seed Media Types
    console.log('🌱 Seeding media types...');
    await db.execute(sql`
      INSERT INTO media_types (code, label, description, icon, has_regions)
      VALUES 
        ('online', 'Online & Socials', 'YouTube, Meta, LinkedIn', 'globe', FALSE),
        ('podcast', 'Podcast', 'Pre-roll, Mid-roll', 'mic-2', FALSE),
        ('radio_national', 'Radio (Nationaal)', 'Landelijke zenders', 'radio', FALSE),
        ('radio_regional', 'Radio (Regionaal)', 'Regionale zenders', 'radio', TRUE),
        ('tv_national', 'TV (Nationaal)', 'Landelijke zenders', 'tv', FALSE),
        ('tv_regional', 'TV (Regionaal)', 'Regionale zenders', 'tv', TRUE)
      ON CONFLICT (code) DO NOTHING
    `);

    // 7. Add missing columns to actors
    console.log('🎙️ Adding missing columns to actors...');
    await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS gender_id INTEGER REFERENCES genders(id)`);
    await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS native_language_id INTEGER REFERENCES languages(id)`);
    await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id)`);
    await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS status_id INTEGER REFERENCES actor_statuses(id)`);
    await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS experience_level_id INTEGER REFERENCES experience_levels(id)`);

    // 8. Atomic Mapping: Update actors.gender_id based on actors.gender
    console.log('🎙️ Mapping actors.gender_id...');
    await db.execute(sql`
      UPDATE actors
      SET gender_id = g.id
      FROM genders g
      WHERE actors.gender = g.code AND actors.gender_id IS NULL
    `);

    // 9. Atomic Mapping: Update actors.native_language_id based on native_lang (if exists)
    console.log('🗣️ Mapping actors.native_language_id...');
    try {
      await db.execute(sql`
        UPDATE actors
        SET native_language_id = l.id
        FROM languages l
        WHERE (actors.native_lang = l.code OR actors.native_lang = l.label) AND actors.native_language_id IS NULL
      `);
    } catch (e) {
      console.warn('⚠️ native_lang column not found, skipping mapping.');
    }

    // 11. Atomic Mapping: Actor Demos types to Media Types (if applicable)
    console.log('🎵 Mapping actor_demos types to media_types...');
    await db.execute(sql`ALTER TABLE actor_demos ADD COLUMN IF NOT EXISTS media_type_id INTEGER REFERENCES media_types(id)`);
    
    await db.execute(sql`
      UPDATE actor_demos
      SET media_type_id = (SELECT id FROM media_types WHERE code = 'online')
      WHERE type = 'commercial' AND media_type_id IS NULL
    `);

    // 12. Cleanup legacy gender string values that are now mapped
    console.log('🧹 Cleaning up legacy data...');
    // We don't delete columns yet, but we can normalize the data
    await db.execute(sql`UPDATE actors SET gender = gender_id::text WHERE gender_id IS NOT NULL AND gender != gender_id::text`);

    console.log('\n✅ SETUP COMPLETE.');
  } catch (err) {
    console.error('\n❌ SETUP FAILED:', err);
  }
  process.exit(0);
}

setupTables();
