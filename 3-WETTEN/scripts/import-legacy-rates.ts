
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

// Keys we want to extract and their mapping to the new JSON structure
// Format: legacy_key -> { country: 'BE', type: 'radio_national' }
const KEY_MAP: Record<string, { country?: string; type: string }> = {};

const COUNTRIES = ['be', 'nl', 'fr', 'de', 'uk', 'us'];
const TYPES = [
  'online_media', 
  'podcast_preroll', 
  'radio_local', 'radio_regional', 'radio_national',
  'tv_local', 'tv_regional', 'tv_national'
];

// Generate the map
COUNTRIES.forEach(c => {
  TYPES.forEach(t => {
    const legacyKey = `${c}_price_${t}`;
    // Map 'online_media' to 'online' to match current schema
    const newType = t === 'online_media' ? 'online' : t === 'podcast_preroll' ? 'podcast' : t;
    KEY_MAP[legacyKey] = { country: c.toUpperCase(), type: newType };
  });
});

// Add global keys (fallback or specific)
KEY_MAP['price_unpaid_media'] = { country: 'BE', type: 'unpaid' }; // Assuming BE as base
KEY_MAP['price_ivr'] = { country: 'BE', type: 'ivr' };
KEY_MAP['price_live_regie'] = { country: 'BE', type: 'live_regie' };

async function importLegacyRates() {
  console.log('🚀 Starting Legacy Rates Import...');
  console.log(`📂 Reading from: ${SQL_FILE}`);

  if (!fs.existsSync(SQL_FILE)) {
    console.error('❌ SQL file not found!');
    process.exit(1);
  }

  const fileStream = fs.createReadStream(SQL_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Store extracted rates: post_id -> { country -> { type -> price } }
  const extractedRates: Record<number, Record<string, Record<string, number>>> = {};
  let linesProcessed = 0;
  let matchesFound = 0;

  console.log('⏳ Parsing SQL dump (this might take a moment)...');

  for await (const line of rl) {
    linesProcessed++;
    if (linesProcessed % 100000 === 0) process.stdout.write('.');

    // Regex to find relevant keys in ANY line (assuming extended inserts or line-per-tuple)
    // Matches: (meta_id, post_id, 'key', 'value')
    // We look for our specific keys to avoid processing irrelevant data
    
    // Optimization: Only regex if line contains "price"
    if (line.includes('price')) {
      const regex = /\(\d+,\s*(\d+),\s*'([a-z0-9_]+)',\s*'([^']*)'\)/g;
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        const postId = parseInt(match[1]);
        const key = match[2];
        const value = match[3];

        if (KEY_MAP[key]) {
          const { country, type } = KEY_MAP[key];
          const price = parseFloat(value);

          if (!isNaN(price) && price > 0) {
            if (!extractedRates[postId]) extractedRates[postId] = {};
            const targetCountry = country || 'BE';
            
            if (!extractedRates[postId][targetCountry]) extractedRates[postId][targetCountry] = {};
            extractedRates[postId][targetCountry][type] = price;
            matchesFound++;
          }
        }
      }
    }
  }

  console.log(`\n✅ Parsing complete. Found ${matchesFound} rate entries for ${Object.keys(extractedRates).length} items.`);

  console.log('💾 Updating Database...');
  
  let updatedCount = 0;
  
  // Iterate over found items
  for (const [wpIdStr, newRates] of Object.entries(extractedRates)) {
    const wpId = parseInt(wpIdStr);
    
    // Find actor by wpProductId
    // Use raw query or cast to any to avoid type mismatch in script context
    const allActors = await db.select().from(actors);
    const actor = allActors.find(a => a.wpProductId === wpId);

    if (actor) {
      // Merge with existing rates
      const currentRates = (actor.rates as Record<string, any>) || {};
      
      // Deep merge
      for (const [country, types] of Object.entries(newRates)) {
        if (!currentRates[country]) currentRates[country] = {};
        for (const [type, price] of Object.entries(types)) {
          // Overwrite or set
          currentRates[country][type] = price;
        }
      }

      // Update DB
      // Use any cast to bypass strict type check in script
      await db.update(actors)
        .set({ 
            rates: currentRates,
            isManuallyEdited: true // Mark as touched
        })
        .where(eq(actors.id as any, actor.id));
      
      updatedCount++;
      // console.log(`Updated actor: ${actor.firstName} ${actor.lastName} (WP: ${wpId})`);
    }
  }

  console.log(`🎉 Migration finished! Updated ${updatedCount} actors.`);
  process.exit(0);
}

importLegacyRates().catch(e => {
  console.error(e);
  process.exit(1);
});
