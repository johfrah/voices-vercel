import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Starting Relational Language Migration...');
  console.log('Supabase URL:', supabaseUrl);

  // 1. Create languages table
  console.log('Creating "languages" table...');
  try {
    const { data: rpcData, error: langTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS languages (
          id SERIAL PRIMARY KEY,
          code TEXT UNIQUE NOT NULL,
          label TEXT NOT NULL,
          is_popular BOOLEAN DEFAULT false,
          is_native_only BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
        );
      `
    });
    console.log('RPC Lang Result:', { rpcData, langTableError });
  } catch (e) {
    console.error('Catch Lang Error:', e);
  }

  // 2. Create actor_languages table
  console.log('Creating "actor_languages" table...');
  try {
    const { data: rpcData2, error: actorLangTableError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS actor_languages (
          id SERIAL PRIMARY KEY,
          actor_id INTEGER REFERENCES actors(id) ON DELETE CASCADE,
          language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
          is_native BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
          UNIQUE(actor_id, language_id)
        );
      `
    });
    console.log('RPC ActorLang Result:', { rpcData2, actorLangTableError });
  } catch (e) {
    console.error('Catch ActorLang Error:', e);
  }

  // 3. Seed languages
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
    await supabase.from('languages').upsert(lang, { onConflict: 'code' });
  }

  // 4. Migrate Data
  console.log('Migrating actor data...');
  const { data: actorsData } = await supabase.from('actors').select('id, native_lang, extra_langs');
  const { data: dbLangs } = await supabase.from('languages').select('id, code, label');

  const langMap = new Map();
  dbLangs?.forEach(l => {
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

  for (const actor of actorsData || []) {
    // Native
    const nativeVal = actor.native_lang?.toLowerCase();
    const nativeId = langMap.get(nativeVal);
    if (nativeId) {
      await supabase.from('actor_languages').upsert({
        actor_id: actor.id,
        language_id: nativeId,
        is_native: true
      }, { onConflict: 'actor_id,language_id' });
    }

    // Extra
    if (actor.extra_langs) {
      const extras = actor.extra_langs.split(',').map((l: string) => l.trim().toLowerCase());
      for (const extra of extras) {
        const extraId = langMap.get(extra);
        // 🛡️ CHRIS-PROTOCOL: Prevent Vlaams as extra, and prevent extra === native
        const isVlaams = extra === 'vlaams' || extra === 'nl-be';
        if (extraId && extraId !== nativeId && !isVlaams) {
          await supabase.from('actor_languages').upsert({
            actor_id: actor.id,
            language_id: extraId,
            is_native: false
          }, { onConflict: 'actor_id,language_id' });
        }
      }
    }
  }

  console.log('✅ Migration completed successfully.');
}

migrate();
