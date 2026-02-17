const { db } = require('../../1-SITE/apps/web/src/lib/sync/bridge');
const { sql } = require('drizzle-orm');
const fs = require('fs');

async function fullForensicAudit() {
  console.log('🔍 STARTING FULL FORENSIC AUDIT (GOD MODE 2026)');
  
  const sqlDump = fs.readFileSync('4-KELDER/CONTAINER/ID348299_voices.sql', 'utf8');
  
  // 1. Map all language terms from SQL
  const termMap = {
    2620: 'en-gb', // Engels
    2622: 'fr-fr', // Frans
    2623: 'de-de', // Duits
    2624: 'es-es', // Spaans
    2913: 'ca-es', // Catalaans
    2969: 'pt-pt', // Portugees
    2970: 'nl-nl', // Nederlands
    3110: 'en-us', // Engels (Amerikaans)
    3112: 'it-it', // Italiaans
    3113: 'nl-be', // Vlaams
    3114: 'sv-se', // Zweeds
    3115: 'en-gb', // Engels (Brits)
    3127: 'fi-fi', // Fins
    3128: 'nb-no', // Noors
    3129: 'tr-tr', // Turks
    3130: 'hr-hr', // Kroatisch
  };

  // 2. Get all live actors from Supabase
  const actorsRes = await db.execute(sql`SELECT id, wp_product_id, first_name, native_lang FROM actors WHERE status = 'live'`);
  const actors = actorsRes.rows || actorsRes;
  
  console.log(`Found ${actors.length} live actors. Checking each one against SQL relationships...`);

  for (const actor of actors) {
    if (!actor.wp_product_id) continue;

    // 3. Find all term relationships for this product ID in the SQL dump
    // Format in SQL: (183809, 2622, 0)
    const regex = new RegExp('\\(' + actor.wp_product_id + ',\\s*([0-9]+),\\s*0\\)', 'g');
    let match;
    const foundTermIds = [];
    while ((match = regex.exec(sqlDump)) !== null) {
      foundTermIds.push(parseInt(match[1]));
    }

    const secondaryLangs = foundTermIds
      .map(id => termMap[id])
      .filter(code => code && code !== actor.native_lang && code !== 'nl-be'); // Filter native and Vlaams-as-secondary

    if (secondaryLangs.length > 0) {
      const uniqueCodes = [...new Set(secondaryLangs)];
      console.log(`Actor ${actor.first_name} (${actor.wp_product_id}): Found ${uniqueCodes.length} secondary languages in SQL: ${uniqueCodes.join(', ')}`);
      
      for (const langCode of uniqueCodes) {
        const langRes = await db.execute(sql`SELECT id, label FROM languages WHERE code = ${langCode}`);
        const lang = (langRes.rows || langRes)[0];
        if (!lang) continue;

        // Ingest into relational table
        await db.execute(sql`
          INSERT INTO actor_languages (actor_id, language_id, is_native)
          VALUES (${actor.id}, ${lang.id}, false)
          ON CONFLICT (actor_id, language_id) DO NOTHING
        `);
      }

      // Update flat field for frontend
      const allLangsRes = await db.execute(sql`
        SELECT l.label 
        FROM actor_languages al
        JOIN languages l ON al.language_id = l.id
        WHERE al.actor_id = ${actor.id} AND al.is_native = false
      `);
      const labels = (allLangsRes.rows || allLangsRes).map(l => l.label).sort().join(', ');
      await db.execute(sql`UPDATE actors SET extra_langs = ${labels} WHERE id = ${actor.id}`);
    }
  }

  console.log('✨ FULL FORENSIC AUDIT COMPLETE.');
}

fullForensicAudit();
