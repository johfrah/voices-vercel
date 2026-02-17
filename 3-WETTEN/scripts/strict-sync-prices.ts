
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

const SQL_FILE_PATH = path.join(process.cwd(), '4-KELDER/CONTAINER/ID348299_voices.sql');

// Map legacy keys to our clean structure
const KEY_MAP: Record<string, { country?: string; type: string }> = {};
const COUNTRIES = ['be', 'nl', 'fr', 'de', 'uk', 'us'];
const TYPES = [
  'online_media', 
  'podcast_preroll', 
  'radio_local', 'radio_regional', 'radio_national',
  'tv_local', 'tv_regional', 'tv_national',
  'live_regie'
];

// Build the map
COUNTRIES.forEach(c => {
  TYPES.forEach(t => {
    const legacyKey = `${c}_price_${t}`;
    const newType = t === 'online_media' ? 'online' : t === 'podcast_preroll' ? 'podcast' : t;
    KEY_MAP[legacyKey] = { country: c.toUpperCase(), type: newType };
  });
});

// Add non-country specific keys (Base columns)
KEY_MAP['price_online_media'] = { type: 'base_online' };
KEY_MAP['price_unpaid_media'] = { type: 'base_unpaid' };
KEY_MAP['price_ivr'] = { type: 'base_ivr' };
KEY_MAP['price_live_regie'] = { type: 'base_live' };

async function strictSync() {
  console.log('🛡️ Starting STRICT Pricing Sync...');
  
  // 1. Load all actors to map WP ID -> DB ID
  const allActors = await db.select().from(actors);
  const actorMap = new Map(allActors.filter(a => a.wpProductId).map(a => [a.wpProductId, a as any]));
  
  console.log(`Found ${actorMap.size} actors with WP ID.`);

  // 2. Stream SQL and collect ALL rates per actor
  const actorRates = new Map<number, Record<string, string>>(); // WP_ID -> { key: value }

  const fileStream = fs.createReadStream(SQL_FILE_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('📖 Reading SQL dump...');
  
  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount % 500000 === 0) console.log(`Processed ${lineCount} lines...`);

    // Only process INSERT lines for wp_postmeta
    // The line might start with INSERT INTO `wp_postmeta` or be part of a multi-line insert
    // But in this dump, it seems to be one huge line or multiple lines starting with INSERT.
    // Let's just check if the line contains valid data tuples.
    
    // Regex to find: (123, 456, 'some_key', 'some_value')
    const regex = /\((\d+),\s*(\d+),\s*'([^']+)',\s*'([^']*)'\)/g;
    let match;
    let found = false;
    
    while ((match = regex.exec(line)) !== null) {
        found = true;
        const postId = parseInt(match[2]); // Index 2 is post_id
        const key = match[3];              // Index 3 is meta_key
        const value = match[4];            // Index 4 is meta_value

        if (actorMap.has(postId)) {
            // Check if it's a rate key we care about
            if (KEY_MAP[key] || key === 'price_online_media' || key === 'price_unpaid_media' || key === 'price_ivr' || key === 'price_live_regie') {
                if (!actorRates.has(postId)) {
                    actorRates.set(postId, {});
                }
                actorRates.get(postId)![key] = value;
                if (postId === 228397) console.log('DEBUG SQL Annelies:', key, value);
            }
        }
    }
    
    // if (!found && line.length > 100) console.log('No matches in line:', line.substring(0, 100));
  }

  // 3. Update ALL actors
  // If an actor is in the DB but NOT in the SQL map, it means they have NO legacy rates.
  // We must clear their rates to avoid hallucinations from previous defaults.
  
  console.log('💾 Updating Database...');
  
  let updatedCount = 0;
  let clearedCount = 0;

  for (const actor of allActors) {
    // If no WP ID, skip (native new actor?)
    if (!actor.wpProductId) continue;

    const wpId = actor.wpProductId;
    const sqlRates = actorRates.get(wpId);

    const newRates: Record<string, any> = {};
    let priceOnline = 0;
    let priceUnpaid = 0;
    let priceIvr = 0;
    let priceLive = 0;

    if (sqlRates) {
        // Case A: Actor has rates in SQL -> Sync them strictly
        for (const [key, value] of Object.entries(sqlRates)) {
            if (!value || value === '') continue;
            
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue === 0) continue;

            const mapping = KEY_MAP[key];
            if (!mapping) continue;

            if (mapping.type === 'base_online') {
                priceOnline = numValue;
            } else if (mapping.type === 'base_unpaid') {
                priceUnpaid = numValue;
            } else if (mapping.type === 'base_ivr') {
                priceIvr = numValue;
            } else if (mapping.type === 'base_live') {
                priceLive = numValue;
            } else if (mapping.country) {
                if (!newRates[mapping.country]) newRates[mapping.country] = {};
                newRates[mapping.country][mapping.type] = numValue;
            }
        }
        updatedCount++;
    } else {
        // Case B: Actor exists in DB but has NO rates in SQL -> CLEAR THEM
        // This fixes duplicates like Annelies (275334) who have no price rows in SQL
        // but might have '250' from a previous default import.
        // console.log(`Clearing rates for ${actor.firstName} (WP: ${wpId}) - No SQL data`);
        clearedCount++;
    }

    // DEBUG: Force update for Annelies (both IDs) to see what happens
    if (wpId === 228397 || wpId === 275334) {
        console.log(`DEBUG Annelies (WP:${wpId}):`, { priceOnline, priceUnpaid, newRates: JSON.stringify(newRates, null, 2) });
    }

    try {
      await db.update(actors)
        .set({
          priceOnline: priceOnline,
          priceUnpaid: priceUnpaid,
          priceIvr: priceIvr,
          priceLiveRegie: priceLive,
          rates: newRates,
          isManuallyEdited: true
        })
        .where(eq(actors.id as any, (actor as any).id));
        
      if ((updatedCount + clearedCount) % 50 === 0) process.stdout.write('.');
    } catch (err) {
      console.error(`Error updating actor ${wpId}:`, err);
    }
  }

  console.log(`\n✅ Strict Sync Complete!`);
  console.log(`- Updated from SQL: ${updatedCount}`);
  console.log(`- Cleared (No SQL data): ${clearedCount}`);
  process.exit(0);
}

strictSync().catch(console.error);
