
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function nuclearGhostCleanup() {
  console.log(`🚀 Start NUCLEAR GHOST CLEANUP (Zuiveren van database placeholders)...\n`);

  const sqlPath = path.join(process.cwd(), '4-KELDER/CONTAINER/ID348299_voices.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ SQL dump niet gevonden.");
    process.exit(1);
  }

  try {
    const allActors = await db.select().from(actors);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    let totalCleaned = 0;

    for (const actor of allActors) {
      if (!actor.wpProductId) continue;
      
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      let hasChanges = false;
      const newRates: Record<string, any> = JSON.parse(JSON.stringify(rates));

      for (const [country, countryRates] of Object.entries(newRates)) {
        if (typeof countryRates !== 'object') continue;

        for (const [type, price] of Object.entries(countryRates)) {
          const numPrice = parseFloat(price as string);
          
          // We targeten de specifieke ghost bedragen
          if (numPrice === 250 || numPrice === 450 || numPrice === 239) {
            // Check of dit bedrag ECHT in de SQL staat
            const metaKey = `${country.toLowerCase()}_price_${type}`;
            const legacyMetaKey = `price_${type}`;
            const regex = new RegExp(`\\(${actor.wpProductId},[^,]*'(${metaKey}|${legacyMetaKey})',[^,]*'([^']*)'\\)`, 'g');
            const matches = [...sqlContent.matchAll(regex)];
            
            const sqlValue = matches.length > 0 ? matches[0][2] : null;

            // Als het niet in de SQL staat, of de SQL waarde is leeg/anders, dan is het een ghost
            if (!sqlValue || parseFloat(sqlValue) !== numPrice) {
              console.log(`🧹 Cleaning ghost: ${actor.firstName} | ${country} ${type} | €${price} (Niet in SQL)`);
              delete (newRates[country] as any)[type];
              hasChanges = true;
              totalCleaned++;
            }
          }
        }
      }

      if (hasChanges) {
        // Update de database
        await db.update(actors)
          .set({ rates: newRates })
          .where(sql`id = ${actor.id}`);
      }
    }

    console.log(`\n✅ NUCLEAR CLEANUP VOLTOOID!`);
    console.log(`📊 Totaal aantal ghost rates verwijderd: ${totalCleaned}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup gefaald:", error);
    process.exit(1);
  }
}

nuclearGhostCleanup();
