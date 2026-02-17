
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function auditNationalRates() {
  console.log(`🔍 AUDIT: Nationale tarieven die mogelijk te laag zijn (< €500)...\n`);

  try {
    const allActors = await db.select().from(actors);
    const suspicious: any[] = [];

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [country, countryRates] of Object.entries(rates)) {
        for (const [type, price] of Object.entries(countryRates)) {
          if (type.includes('national') || type === 'online') {
            const numPrice = parseFloat(price as string);
            if (numPrice > 0 && numPrice < 500) {
              suspicious.push({
                name: `${actor.firstName} ${actor.lastName}`,
                wpId: actor.wpProductId,
                country,
                type,
                price: numPrice
              });
            }
          }
        }
      }
    }

    suspicious.sort((a, b) => a.price - b.price);

    console.log(`| Voice Actor | WP ID | Land | Type | Tarief |`);
    console.log(`| :--- | :--- | :--- | :--- | :--- |`);
    suspicious.forEach(s => {
      console.log(`| ${s.name} | ${s.wpId} | ${s.country} | ${s.type} | **€${s.price}** |`);
    });

    console.log(`\n✅ Totaal ${suspicious.length} verdachte tarieven gevonden.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

auditNationalRates();
