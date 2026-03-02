import { db } from './bridge.ts';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log(' Starting Relational Language Migration (Drizzle Script)...');

  try {
    // 1. Create tables
    console.log('Creating tables...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS languages (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        is_popular BOOLEAN DEFAULT false,
        is_native_only BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
      );
    `);
    console.log(' languages table ready');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS actor_languages (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
        language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
        is_native BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
        UNIQUE(actor_id, language_id)
      );
    `);
    console.log(' actor_languages table ready');

    // 2. Seed languages
    console.log('Seeding languages...');
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
      { code: 'pt-pt', label: 'Portugees', is_popular: true },
      { code: 'pl-pl', label: 'Pools' },
      { code: 'da-dk', label: 'Deens' },
      { code: 'sv-se', label: 'Zweeds' },
      { code: 'tr-tr', label: 'Turks' },
      { code: 'ru-ru', label: 'Russisch' },
      { code: 'ar-sa', label: 'Arabisch' },
      { code: 'zh-cn', label: 'Chinees' },
      { code: 'ja-jp', label: 'Japans' }
    ];

    for (const lang of languages) {
      await db.execute(sql`
        INSERT INTO languages (code, label, is_popular, is_native_only)
        VALUES (${lang.code}, ${lang.label}, ${lang.is_popular}, ${lang.is_native_only})
        ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, is_popular = EXCLUDED.is_popular, is_native_only = EXCLUDED.is_native_only
      `);
    }
    console.log(' languages seeded');

    // 3. Migrate data
    console.log('Migrating data...');
    const actorsResult = await db.execute(sql`SELECT id, native_lang, extra_langs FROM actors`);
    const langsResult = await db.execute(sql`SELECT id, code, label FROM languages`);
    
    const langMap = new Map();
    langsResult.rows.forEach((l: any) => {
      langMap.set(l.code.toLowerCase(), l.id);
      langMap.set(l.label.toLowerCase(), l.id);
    });

    // Manual mapping for common variations
    langMap.set('vlaams', langMap.get('nl-be'));
    langMap.set('nederlands', langMap.get('nl-nl'));
    langMap.set('frans', langMap.get('fr-fr'));
    langMap.set('engels', langMap.get('en-gb'));
    langMap.set('duits', langMap.get('de-de'));
    langMap.set('spaans', langMap.get('es-es'));
    langMap.set('italiaans', langMap.get('it-it'));

    for (const actor of actorsResult.rows as any[]) {
      // Native
      const nativeVal = actor.native_lang?.toLowerCase();
      const nativeId = langMap.get(nativeVal);
      if (nativeId) {
        await db.execute(sql`
          INSERT INTO actor_languages (actor_id, language_id, is_native)
          VALUES (${actor.id}, ${nativeId}, true)
          ON CONFLICT (actor_id, language_id) DO UPDATE SET is_native = true
        `);
      }

      // Extra
      if (actor.extra_langs) {
        const extras = actor.extra_langs.split(',').map((l: string) => l.trim().toLowerCase());
        for (const extra of extras) {
          const extraId = langMap.get(extra);
          const isVlaams = extra === 'vlaams' || extra === 'nl-be';
          if (extraId && extraId !== nativeId && !isVlaams) {
            await db.execute(sql`
              INSERT INTO actor_languages (actor_id, language_id, is_native)
              VALUES (${actor.id}, ${extraId}, false)
              ON CONFLICT (actor_id, language_id) DO NOTHING
            `);
          }
        }
      }
    }
    console.log(' data migrated');

  } catch (err) {
    console.error(' Migration failed:', err);
  }
}

migrate();
