import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Load env
const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { eq } from 'drizzle-orm';
import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

const SQL_FILE = path.join(process.cwd(), '4-KELDER/CONTAINER/ID348299_voices.sql');

const BSF = 249;
const MIN_BUYOUT_NATIONAL = 100;
const MIN_BUYOUT_ONLINE = 50;

// Keys we want to extract
const KEY_MAP: Record<string, { country: string; type: string }> = {};
const COUNTRIES = ['be', 'nl', 'fr', 'de', 'uk', 'us'];
const TYPES = [
  'online_media', 
  'podcast_preroll', 
  'radio_local', 'radio_regional', 'radio_national',
  'tv_local', 'tv_regional', 'tv_national'
];

COUNTRIES.forEach(c => {
  TYPES.forEach(t => {
    const legacyKey = `${c}_price_${t}`;
    const newType = t === 'online_media' ? 'online' : t === 'podcast_preroll' ? 'podcast' : t;
    KEY_MAP[legacyKey] = { country: c.toUpperCase(), type: newType };
  });
});

KEY_MAP['price_unpaid_media'] = { country: 'BE', type: 'unpaid' };
KEY_MAP['price_ivr'] = { country: 'BE', type: 'ivr' };
KEY_MAP['price_live_regie'] = { country: 'BE', type: 'live_regie' };

function calculateNewPrice(type: string, oldPrice: number): number {
  if (type === 'ivr') return 89;
  if (type === 'unpaid') return 249;

  if (type === 'radio_national' || type === 'tv_national' || type === 'podcast') {
    const oldBuyout = oldPrice - BSF;
    const newBuyout = Math.max(100, Math.round(oldBuyout / 50) * 50);
    return BSF + newBuyout;
  } else if (type === 'online') {
    const oldBuyout = oldPrice - BSF;
    const newBuyout = Math.max(50, Math.round(oldBuyout / 50) * 50);
    return BSF + newBuyout;
  } else {
    const minPrice = 50;
    const rounded = Math.round(oldPrice / 50) * 50;
    return Math.max(minPrice, rounded);
  }
}

async function migrateRates() {
  console.log('🚀 Starting Final Pricing Migration to Supabase...');
  
  if (!fs.existsSync(SQL_FILE)) {
    console.error('❌ SQL file not found!');
    process.exit(1);
  }

  const allActors = await db.select().from(actors) as any[];
  const wpIdToActor = new Map(allActors.map(a => [a.wpProductId, a]));
  const actorWpIds = new Set(allActors.map(a => a.wpProductId).filter(id => id !== null));

  console.log(`📊 Found ${allActors.length} actors in Supabase.`);

  const fileStream = fs.createReadStream(SQL_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const extractedRates: Record<number, Record<string, Record<string, number>>> = {};
  let linesProcessed = 0;

  console.log('⏳ Parsing SQL dump...');

  for await (const line of rl) {
    linesProcessed++;
    if (linesProcessed % 1000000 === 0) process.stdout.write('.');

    if (line.includes('price')) {
      const regex = /\(\d+,\s*(\d+),\s*'([a-z0-9_]+)',\s*'([^']*)'\)/g;
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        const wpId = parseInt(match[1]);
        const key = match[2];
        const value = match[3];

        if (actorWpIds.has(wpId) && KEY_MAP[key]) {
          const { country, type } = KEY_MAP[key];
          const price = parseFloat(value);

          if (!isNaN(price) && price > 0) {
            if (!extractedRates[wpId]) extractedRates[wpId] = {};
            if (!extractedRates[wpId][country]) extractedRates[wpId][country] = {};
            extractedRates[wpId][country][type] = price;
          }
        }
      }
    }
  }

  console.log('\n✅ Parsing complete. Starting database updates...');

  let updatedCount = 0;
  for (const [wpIdStr, countries] of Object.entries(extractedRates)) {
    const wpId = parseInt(wpIdStr);
    const actor = wpIdToActor.get(wpId);
    if (!actor) continue;

    const processedRates: Record<string, Record<string, number>> = {};
    for (const [country, types] of Object.entries(countries)) {
      processedRates[country] = {};
      for (const [type, oldPrice] of Object.entries(types)) {
        processedRates[country][type] = calculateNewPrice(type, oldPrice);
      }
    }

    const countryCodes = Object.keys(processedRates);
    let finalRates: Record<string, any> = {};

    if (countryCodes.length === 1) {
      finalRates['GLOBAL'] = processedRates[countryCodes[0]];
    } else {
      const firstCountry = countryCodes[0];
      const firstRatesStr = JSON.stringify(processedRates[firstCountry]);
      const allIdentical = countryCodes.every(c => JSON.stringify(processedRates[c]) === firstRatesStr);

      if (allIdentical) {
        finalRates['GLOBAL'] = processedRates[firstCountry];
      } else {
        finalRates = processedRates;
      }
    }

    // Update actor in Supabase
    await db.update(actors)
      .set({ 
        rates: finalRates,
        isManuallyEdited: true,
        updatedAt: new Date()
      })
      .where(eq(actors.id as any, actor.id));

    updatedCount++;
    if (updatedCount % 50 === 0) console.log(`📦 Updated ${updatedCount} actors...`);
  }

  console.log(`\n🎉 Migration finished! Successfully updated ${updatedCount} actors in Supabase.`);
  process.exit(0);
}

migrateRates().catch(e => {
  console.error('❌ Migration failed:', e);
  process.exit(1);
});
