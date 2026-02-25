
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function migrateToGlobalFirst() {
  console.log(`🚀 Start GLOBAL-FIRST MIGRATIE (Consolidatie van BE naar GLOBAL)...\n`);

  try {
    const allActors = await db.select().from(actors);
    let totalMigrated = 0;

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates || Object.keys(rates).length === 0) continue;

      let hasChanges = false;
      const newRates: Record<string, any> = JSON.parse(JSON.stringify(rates));

      // 1. Haal de BE tarieven op (onze historische 'global' basis)
      const beRates = newRates['BE'] || {};
      
      if (Object.keys(beRates).length > 0) {
        // 2. Maak een GLOBAL object aan als het nog niet bestaat
        if (!newRates['GLOBAL']) {
          newRates['GLOBAL'] = {};
        }

        // 3. Verplaats BE tarieven naar GLOBAL, tenzij GLOBAL al iets heeft (bescherming)
        for (const [type, price] of Object.entries(beRates)) {
          if (newRates['GLOBAL'][type] === undefined) {
            console.log(`🌍 Migrating: ${actor.firstName} | ${type} | €${price} -> GLOBAL`);
            newRates['GLOBAL'][type] = price;
            hasChanges = true;
          }
        }

        // 4. Verwijder de BE key (want BE volgt nu GLOBAL)
        // BE wordt nu een 'uitzondering' land, en aangezien het gelijk is aan GLOBAL, 
        // hebben we de specifieke BE key niet meer nodig.
        delete newRates['BE'];
        hasChanges = true;
        totalMigrated++;
      }

      if (hasChanges) {
        await db.update(actors)
          .set({ rates: newRates })
          .where(sql`id = ${actor.id}`);
      }
    }

    console.log(`\n✅ GLOBAL-FIRST MIGRATIE VOLTOOID!`);
    console.log(`📊 Totaal aantal stemmen geconsolideerd naar GLOBAL: ${totalMigrated}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migratie gefaald:", error);
    process.exit(1);
  }
}

migrateToGlobalFirst();
