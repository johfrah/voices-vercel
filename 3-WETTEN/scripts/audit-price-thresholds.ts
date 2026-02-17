
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function analyzePriceThresholds() {
  console.log(`📊 Analyzing price thresholds for Commercial Media...\n`);

  try {
    const allActors = await db.select().from(actors);
    
    const under100: any[] = [];
    const between100And249: any[] = [];

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [country, countryRates] of Object.entries(rates)) {
        for (const [type, price] of Object.entries(countryRates)) {
          // Skip non-commercial types for this specific audit
          if (['ivr', 'unpaid', 'live_regie'].includes(type)) continue;

          const numPrice = parseFloat(price as string);
          if (numPrice <= 0) continue;

          const entry = {
            name: `${actor.firstName} ${actor.lastName}`,
            country,
            type,
            price: numPrice
          };

          if (numPrice < 100) {
            under100.push(entry);
          } else if (numPrice < 249) {
            between100And249.push(entry);
          }
        }
      }
    }

    console.log(`### 🚨 TARIEVEN LAGER DAN €100 (${under100.length} gevallen)`);
    console.log(`| Voice Actor | Country | Type | Prijs |`);
    console.log(`| :--- | :--- | :--- | :--- |`);
    under100.sort((a, b) => a.price - b.price).forEach(i => {
      console.log(`| ${i.name} | ${i.country} | ${i.type} | **€${i.price}** |`);
    });

    console.log(`\n### 🔸 TARIEVEN TUSSEN €100 EN €249 (${between100And249.length} gevallen)`);
    console.log(`| Voice Actor | Country | Type | Prijs |`);
    console.log(`| :--- | :--- | :--- | :--- |`);
    between100And249.sort((a, b) => a.price - b.price).forEach(i => {
      console.log(`| ${i.name} | ${i.country} | ${i.type} | **€${i.price}** |`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

analyzePriceThresholds();
