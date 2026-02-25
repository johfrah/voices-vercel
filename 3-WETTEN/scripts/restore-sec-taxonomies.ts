const { db } = require('../../1-SITE/apps/web/src/lib/sync/bridge');
const { sql } = require('drizzle-orm');

/**
 * 🛡️ CHRIS-PROTOCOL: Forensic Data Restoration
 * This script extracts the 'sec' (secondary language) taxonomy relations from the legacy SQL
 * and injects them into our new relational actor_languages table in Supabase.
 */

async function restoreSecondaryLanguages() {
  console.log('🚀 Starting Forensic Secondary Language Restoration...');

  try {
    // 1. Get all actors to match names
    const actorsResult = await db.execute(sql`SELECT id, first_name FROM actors`);
    console.log('Actors query result:', actorsResult);
    const actors = actorsResult.rows || actorsResult;
    console.log(`Found ${actors.length} actors in Supabase.`);

    // 2. Get all languages to match codes
    const langsResult = await db.execute(sql`SELECT id, code, label FROM languages`);
    const languages = langsResult.rows || langsResult;

    // Mapping from Legacy Term IDs to our new Language Codes
    // Based on forensic analysis of the SQL dump
    const termMap: Record<number, string> = {
      2620: 'en-gb', // Engels
      2622: 'fr-fr', // Frans
      2623: 'de-de', // Duits
      2624: 'es-es', // Spaans
      2913: 'ca-es', // Catalaans (need to add)
      2969: 'pt-pt', // Portugees
      2970: 'nl-nl', // Nederlands
      3110: 'en-us', // Engels (Amerikaans)
      3112: 'it-it', // Italiaans
      3113: 'nl-be', // Vlaams (Note: usually native, but present in sec)
      3114: 'sv-se', // Zweeds (need to add)
      3115: 'en-gb', // Engels (Brits)
      3127: 'fi-fi', // Fins (need to add)
      3128: 'nb-no', // Noors (need to add)
      3129: 'tr-tr', // Turks (need to add)
      3130: 'hr-hr', // Kroatisch (need to add)
    };

    // 3. Ensure all languages exist in our table
    console.log('Ensuring all legacy languages exist in Supabase...');
    const extraLangs = [
      { code: 'ca-es', label: 'Catalaans' },
      { code: 'sv-se', label: 'Zweeds' },
      { code: 'fi-fi', label: 'Fins' },
      { code: 'nb-no', label: 'Noors' },
      { code: 'tr-tr', label: 'Turks' },
      { code: 'hr-hr', label: 'Kroatisch' },
    ];

    for (const lang of extraLangs) {
      await db.execute(sql`
        INSERT INTO languages (code, label)
        VALUES (${lang.code}, ${lang.label})
        ON CONFLICT (code) DO NOTHING
      `);
    }
    
    // Refresh languages list
    const updatedLangsResult = await db.execute(sql`SELECT id, code FROM languages`);
    const updatedLangs = (updatedLangsResult.rows || updatedLangsResult) as any[];

    // 4. Hardcoded relations from forensic analysis of wp_term_relationships
    // Format: [ActorName, [TermIDs]]
    // This is a subset for verification, we can expand this or parse the whole SQL if needed.
    const relations: [string, number[]][] = [
      ['Serge', [2620, 2622, 2623]], // ID 186533: en, fr, de
      ['Johfrah', [2620, 2622]],     // ID 182508: en, fr
      ['Kristel', [2620, 2622]],     // ID 184388: en, fr
      ['Machteld', [2620, 2622, 2623, 2970]], // ID 189009: en, fr, de, nl
      ['Ruben', [2620, 2622, 2970]], // ID 194242: en, fr, nl
      ['Christina', [2620, 2624, 2623]], // Added 2623 (Duits) based on user feedback
      ['Kristien', [2624]],          // Spaans
      ['Maria', [2620, 2622, 2624]], // en, fr, es
    ];

    console.log('Injecting secondary language relations...');
    let count = 0;

    for (const [name, termIds] of relations) {
      const actor = actors.find(a => a.first_name.toLowerCase() === name.toLowerCase());
      if (!actor) {
        console.warn(`⚠️ Actor not found: ${name}`);
        continue;
      }

      for (const termId of termIds) {
        const langCode = termMap[termId];
        if (!langCode) continue;

        const lang = updatedLangs.find(l => l.code === langCode);
        if (!lang) continue;

        // 🛡️ CHRIS-PROTOCOL: Prevent Vlaams as secondary language for natives
        if (langCode === 'nl-be') continue;

        await db.execute(sql`
          INSERT INTO actor_languages (actor_id, language_id, is_native)
          VALUES (${actor.id}, ${lang.id}, false)
          ON CONFLICT (actor_id, language_id) DO UPDATE SET is_native = EXCLUDED.is_native
        `);
        count++;
      }
    }

    console.log(`✅ Successfully restored ${count} secondary language relations.`);
    
    // 5. Update the flat 'extra_langs' field for backward compatibility until frontend is fully relational
    console.log('Updating legacy extra_langs fields for backward compatibility...');
    for (const [name] of relations) {
      const actor = actors.find(a => a.first_name.toLowerCase() === name.toLowerCase());
      if (!actor) continue;

      const actorLangsResult = await db.execute(sql`
        SELECT l.label 
        FROM actor_languages al
        JOIN languages l ON al.language_id = l.id
        WHERE al.actor_id = ${actor.id} AND al.is_native = false
      `);
      const actorLangs = (actorLangsResult.rows || actorLangsResult) as any[];

      const extraLangsStr = actorLangs.map(l => l.label).join(', ');
      
      await db.execute(sql`
        UPDATE actors SET extra_langs = ${extraLangsStr} WHERE id = ${actor.id}
      `);
    }
    console.log('✅ Legacy fields updated.');

  } catch (err) {
    console.error('❌ Restoration failed:', err);
  }
}

restoreSecondaryLanguages();
