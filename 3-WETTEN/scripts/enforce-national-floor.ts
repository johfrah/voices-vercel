import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function enforceNationalFloor() {
  const FLOOR = 249;
  console.log(`🚀 START: Handhaven van de Nationale Floor (€${FLOOR})...\n`);

  try {
    const allActors = await db.select().from(actors);
    let updatedCount = 0;

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      let hasChanges = false;
      const newRates = JSON.parse(JSON.stringify(rates));

      for (const [country, countryRates] of Object.entries(newRates)) {
        if (typeof countryRates !== 'object' || countryRates === null) continue;
        
        for (const [type, price] of Object.entries(countryRates)) {
          // Check voor nationale types
          if (type.includes('national') || type === 'online') {
            const numPrice = parseFloat(price as string);
            if (numPrice > 0 && numPrice < FLOOR) {
              console.log(`📍 [${actor.firstName} ${actor.lastName}] ${country}.${type}: €${numPrice} -> €${FLOOR}`);
              (newRates[country] as any)[type] = FLOOR.toString();
              hasChanges = true;
            }
          }
        }
      }

      if (hasChanges) {
        await db.update(actors)
          .set({ rates: newRates })
          .where(sql`id = ${actor.id}`);
        updatedCount++;
      }
    }

    console.log(`\n✅ Klaar! ${updatedCount} stemacteurs bijgewerkt naar de €${FLOOR} floor.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Fout bij het bijwerken:', error);
    process.exit(1);
  }
}

enforceNationalFloor();
