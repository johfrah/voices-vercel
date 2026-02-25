
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { eq } from 'drizzle-orm';
import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function migrateLiveRegie() {
  console.log('🚀 Starting Global Live Regie Migration...');

  try {
    const allActors = await db.select().from(actors);
    let updatedCount = 0;

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      let foundLiveRegiePrice = 0;
      let hasChanges = false;

      // 1. Zoek naar live_regie in alle landen
      for (const country of Object.keys(rates)) {
        if (typeof rates[country] === 'object' && rates[country] !== null) {
          if ('live_regie' in rates[country]) {
            const price = parseFloat(rates[country].live_regie);
            if (price > 0) {
              foundLiveRegiePrice = price;
              console.log(`📍 Found live_regie (€${price}) in ${country} for ${actor.firstName} ${actor.lastName}`);
            }
            // Verwijder het uit de land-specifieke JSON
            delete rates[country]['live_regie'];
            hasChanges = true;
          }
        }
      }

      // 2. Als we een prijs hebben gevonden, zet deze in de hoofd-kolom
      if (foundLiveRegiePrice > 0 || hasChanges) {
        // We updaten de priceLiveRegie kolom EN de geschoonde rates JSON
        await db.update(actors)
          .set({ 
            priceLiveRegie: foundLiveRegiePrice.toString(),
            rates: rates,
            isManuallyEdited: true 
          })
          .where(eq(actors.id as any, actor.id));
        
        console.log(`✅ Migrated Live Regie for ${actor.firstName} to base column.`);
        updatedCount++;
      }
    }

    console.log(`\n✨ Migration complete! Updated ${updatedCount} actors.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateLiveRegie();
