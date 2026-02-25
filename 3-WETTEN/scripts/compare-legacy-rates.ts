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
const OUTPUT_FILE = path.join(process.cwd(), '3-WETTEN/docs/PRICING_COMPARISON_V3.md');

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

// Add global keys
KEY_MAP['price_unpaid_media'] = { country: 'BE', type: 'unpaid' };
KEY_MAP['price_ivr'] = { country: 'BE', type: 'ivr' };
KEY_MAP['price_live_regie'] = { country: 'BE', type: 'live_regie' };

function calculateNewPrice(type: string, oldPrice: number): number {
  if (type === 'ivr') return 89;
  if (type === 'unpaid') return 249;

  if (type === 'radio_national' || type === 'tv_national' || type === 'podcast') {
    // National: Total = BSF (249) + Buyout (multiple of 50, min 100)
    const oldBuyout = oldPrice - BSF;
    // Round to nearest 50 (e.g., 101 -> 100, 126 -> 150)
    const newBuyout = Math.max(100, Math.round(oldBuyout / 50) * 50);
    return BSF + newBuyout;
  } else if (type === 'online') {
    // Online: Total = BSF (249) + Buyout (multiple of 50, min 50)
    const oldBuyout = oldPrice - BSF;
    const newBuyout = Math.max(50, Math.round(oldBuyout / 50) * 50);
    return BSF + newBuyout;
  } else {
    // Other (Local/Regional/Live Regie): All-in price, min 50, increments of 50
    const minPrice = 50;
    const rounded = Math.round(oldPrice / 50) * 50;
    return Math.max(minPrice, rounded);
  }
}

async function compareRates() {
  console.log('🚀 Starting Pricing Comparison V3...');
  
  if (!fs.existsSync(SQL_FILE)) {
    console.error('❌ SQL file not found!');
    process.exit(1);
  }

  // Get all actors from Supabase to match WP IDs
  const allActors = await db.select().from(actors) as any[];
  const wpIdToActor = new Map(allActors.map(a => [a.wpProductId, a]));
  const actorWpIds = new Set(allActors.map(a => a.wpProductId).filter(id => id !== null));

  const fileStream = fs.createReadStream(SQL_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const extractedRates: Record<number, Record<string, Record<string, number>>> = {};
  let linesProcessed = 0;

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

  console.log('\n✅ Parsing complete. Processing Global vs Country logic...');

  let mdContent = `# 💰 Pricing Comparison V3: Legacy vs New\n\n`;
  mdContent += `**Rules:**\n`;
  mdContent += `- **IVR:** Fixed €89\n`;
  mdContent += `- **UNPAID:** Fixed €249\n`;
  mdContent += `- **National (Radio/TV/Podcast):** Total = max(Old, 249 + 100), rounded to 50\n`;
  mdContent += `- **Online:** Total = max(Old, 249 + 50), rounded to 50\n`;
  mdContent += `- **Other (Local/Regional):** All-in, min 50, increments of 50\n`;
  mdContent += `- **Global Logic:** If rates are identical across countries, use GLOBAL. Otherwise use country codes. BE voices preferred as GLOBAL if possible.\n\n`;

  for (const [wpIdStr, countries] of Object.entries(extractedRates)) {
    const wpId = parseInt(wpIdStr);
    const actor = wpIdToActor.get(wpId);
    if (!actor) continue;

    // Calculate new rates for all countries
    const processedRates: Record<string, Record<string, number>> = {};
    for (const [country, types] of Object.entries(countries)) {
      processedRates[country] = {};
      for (const [type, oldPrice] of Object.entries(types)) {
        processedRates[country][type] = calculateNewPrice(type, oldPrice);
      }
    }

    // Determine if we can use GLOBAL
    // If all countries have the same rates, or if there's only one country
    const countryCodes = Object.keys(processedRates);
    let finalRates: Record<string, Record<string, number>> = {};
    let isGlobal = false;

    if (countryCodes.length === 1) {
      // Only one country (usually BE), make it GLOBAL
      finalRates['GLOBAL'] = processedRates[countryCodes[0]];
      isGlobal = true;
    } else {
      // Check if all countries are identical
      const firstCountry = countryCodes[0];
      const firstRatesStr = JSON.stringify(processedRates[firstCountry]);
      const allIdentical = countryCodes.every(c => JSON.stringify(processedRates[c]) === firstRatesStr);

      if (allIdentical) {
        finalRates['GLOBAL'] = processedRates[firstCountry];
        isGlobal = true;
      } else {
        // Not identical, keep countries but check if we can merge some or if BE should be base
        finalRates = processedRates;
      }
    }

    mdContent += `## ${actor.firstName} ${actor.lastName} (WP: ${wpId}) ${isGlobal ? '[GLOBAL]' : '[MULTI-COUNTRY]'}\n`;
    mdContent += `| Scope | Type | Old Total | New Total | Buyout (New) |\n`;
    mdContent += `|-------|------|-----------|-----------|--------------|\n`;

    for (const [scope, types] of Object.entries(finalRates)) {
      for (const [type, newPrice] of Object.entries(types)) {
        // Find old price (might be from different country if GLOBAL)
        let oldPrice = 0;
        if (scope === 'GLOBAL') {
          // Take from first available country in original data
          const firstOrig = Object.keys(countries)[0];
          oldPrice = countries[firstOrig][type] || 0;
        } else {
          oldPrice = countries[scope][type] || 0;
        }

        const isNational = type === 'radio_national' || type === 'tv_national' || type === 'podcast';
        const isOnline = type === 'online';
        
        let buyout = 0;
        if (isNational || isOnline) {
          buyout = newPrice - BSF;
        } else {
          buyout = newPrice; // All-in
        }

        mdContent += `| ${scope} | ${type} | €${oldPrice.toFixed(2)} | **€${newPrice.toFixed(2)}** | €${buyout.toFixed(2)} |\n`;
      }
    }
    mdContent += `\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, mdContent);
  console.log(`🎉 Comparison report V3 generated: ${OUTPUT_FILE}`);
  process.exit(0);
}

compareRates().catch(e => {
  console.error(e);
  process.exit(1);
});
