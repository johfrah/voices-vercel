
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function scanAllRates() {
  console.log('🚀 Scanning ALL actors for specific rate keys...');
  try {
    const allActors = await db.select().from(actors);
    const actorsWithRates = allActors.filter(a => a.rates && Object.keys(a.rates as object).length > 0);
    
    const stats: Record<string, number> = {};
    const examples: Record<string, string> = {};

    let actorsWithDetailedRates = 0;

    for (const actor of actorsWithRates) {
      const rates = actor.rates as any;
      if (!rates) continue;

      let hasDetails = false;

      // Helper to traverse JSON
      const traverse = (obj: any, prefix = '') => {
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            traverse(obj[key], key + '.');
          } else {
            // Check if key contains interesting terms
            if (key.includes('radio') || key.includes('tv') || key.includes('podcast') || key.includes('commercial')) {
               const fullKey = prefix + key;
               stats[fullKey] = (stats[fullKey] || 0) + 1;
               if (!examples[fullKey]) examples[fullKey] = `${actor.firstName} ${actor.lastName} (ID: ${actor.id})`;
               hasDetails = true;
            }
          }
        }
      };

      traverse(rates);
      if (hasDetails) actorsWithDetailedRates++;
    }

    console.log(`\n📊 Analysis of ${allActors.length} actors:`);
    console.log(`Found ${actorsWithDetailedRates} actors with specific media rates in JSON.\n`);
    
    console.log('--- FOUND KEYS ---');
    if (Object.keys(stats).length === 0) {
        console.log('⚠️  NO specific radio/tv/podcast keys found in any rates JSON!');
        console.log('   It seems only standard keys (ivr, online, unpaid) are present.');
    } else {
        for (const [key, count] of Object.entries(stats)) {
            console.log(`${key}: ${count} actors (e.g. ${examples[key]})`);
        }
    }
    console.log('------------------');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

scanAllRates();
