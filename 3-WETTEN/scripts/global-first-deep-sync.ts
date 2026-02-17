
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function globalFirstDeepSync() {
  console.log(`🚀 Start GLOBAL-FIRST DEEP SYNC (Regex SQL to GLOBAL)...\n`);

  const sqlPath = path.join(process.cwd(), '4-KELDER/CONTAINER/ID348299_voices.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ SQL dump niet gevonden.");
    process.exit(1);
  }

  try {
    const allActors = await db.select().from(actors);
    const actorMap = new Map();
    allActors.forEach(a => {
      if (a.wpProductId) actorMap.set(a.wpProductId, a);
    });

    const keyMapping: Record<string, string> = {
      'be_price_online': 'online',
      'be_price_online_media': 'online',
      'be_price_radio_national': 'radio_national',
      'be_price_radio_regional': 'radio_regional',
      'be_price_radio_local': 'radio_local',
      'be_price_tv_national': 'tv_national',
      'be_price_tv_regional': 'tv_regional',
      'be_price_tv_local': 'tv_local',
      'be_price_podcast': 'podcast',
      'be_price_podcast_preroll': 'podcast',
      'be_price_social_media': 'social_media',
      'be_price_ivr': 'ivr',
      'be_price_unpaid_media': 'unpaid',
      'be_price_live_regie': 'live_regie'
    };

    const actorRatesToUpdate = new Map();

    const fileStream = fs.createReadStream(sqlPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    console.log("📖 Reading SQL dump...");
    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
      
      // We zoeken naar regels die lijken op postmeta inserts: (meta_id, post_id, 'meta_key', 'meta_value')
      // De regex moet flexibel zijn voor spaties en aanhalingstekens
      const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const wpId = parseInt(match[2]);
        const metaKey = match[3];
        const metaValue = match[4];

        if (actorMap.has(wpId) && keyMapping[metaKey]) {
          const newKey = keyMapping[metaKey];
          if (metaValue && metaValue !== '' && metaValue !== '0' && metaValue !== '0.00') {
            if (!actorRatesToUpdate.has(wpId)) {
              const actor = actorMap.get(wpId);
              actorRatesToUpdate.set(wpId, JSON.parse(JSON.stringify(actor.rates || {})));
            }
            const currentRates = actorRatesToUpdate.get(wpId);
            if (!currentRates['GLOBAL']) currentRates['GLOBAL'] = {};
            
            // We overschrijven alleen als het nog niet bestaat in GLOBAL
            if (currentRates['GLOBAL'][newKey] === undefined) {
              currentRates['GLOBAL'][newKey] = metaValue;
            }
          }
        }
      }
      if (lineCount % 500000 === 0) console.log(`Processed ${lineCount} lines...`);
    }

    console.log(`\n💾 Updating ${actorRatesToUpdate.size} actors in database...`);
    let totalUpdated = 0;
    for (const [wpId, newRates] of actorRatesToUpdate.entries()) {
      const actor = actorMap.get(wpId);
      
      // Cleanup BE key if it exists
      if (newRates['BE']) delete newRates['BE'];

      await db.update(actors)
        .set({ rates: newRates })
        .where(sql`id = ${actor.id}`);
      totalUpdated++;
    }

    console.log(`\n✅ DEEP SYNC VOLTOOID!`);
    console.log(`📊 Totaal aantal stemmen bijgewerkt: ${totalUpdated}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Deep Sync gefaald:", error);
    process.exit(1);
  }
}

globalFirstDeepSync();
