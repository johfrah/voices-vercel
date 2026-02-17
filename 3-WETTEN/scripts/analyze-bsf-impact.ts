
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function analyzeBsfImpact() {
  const NEW_BSF = 249;
  console.log(`📊 Analyzing impact of BSF €${NEW_BSF} on current rates...\n`);

  try {
    const allActors = await db.select().from(actors);
    const issues: any[] = [];

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [country, countryRates] of Object.entries(rates)) {
        for (const [type, price] of Object.entries(countryRates)) {
          const numPrice = parseFloat(price as string);
          if (numPrice > 0 && numPrice <= NEW_BSF) {
            issues.push({
              name: `${actor.firstName} ${actor.lastName}`,
              country,
              type,
              currentPrice: numPrice,
              diff: numPrice - NEW_BSF
            });
          }
        }
      }
    }

    // Sort by most problematic (lowest price)
    issues.sort((a, b) => a.currentPrice - b.currentPrice);

    console.log(`❌ Found ${issues.length} cases where current price is <= NEW BSF (€${NEW_BSF}):\n`);
    
    console.log(`| Voice Actor | Country | Type | Current | Buyout Result |`);
    console.log(`| :--- | :--- | :--- | :--- | :--- |`);
    
    issues.slice(0, 50).forEach(i => {
      const buyout = i.currentPrice - NEW_BSF;
      const status = buyout < 0 ? "⚠️ NEGATIVE" : "🔸 ZERO/TINY";
      console.log(`| ${i.name} | ${i.country} | ${i.type} | €${i.currentPrice} | **${buyout}** (${status}) |`);
    });

    if (issues.length > 50) {
      console.log(`\n... and ${issues.length - 50} more cases.`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

analyzeBsfImpact();
