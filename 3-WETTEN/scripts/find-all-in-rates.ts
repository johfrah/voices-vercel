
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function findAllInRates() {
  const BSF = 199;
  console.log(`🔍 Zoeken naar 'All-in' tarieven (Landcampagnes < €${BSF})...\n`);

  try {
    const allActors = await db.select().from(actors);
    const allInCases: any[] = [];

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [country, countryRates] of Object.entries(rates)) {
        if (typeof countryRates !== 'object') continue;
        
        for (const [type, price] of Object.entries(countryRates)) {
          // Alleen landcampagnes (geen regionaal/lokaal/podcast)
          const isNational = type.includes('national') || type === 'online' || type === 'social_media';
          if (!isNational) continue;

          let numPrice = parseFloat(price as string);
          if (numPrice <= 0) continue;

          // Pas de Charm Rounding toe om de finale prijs te zien
          if (numPrice < 100) {
            numPrice = Math.ceil(numPrice / 10) * 10 - 1;
          } else {
            numPrice = Math.round(numPrice / 10) * 10 - 1;
          }

          if (numPrice < BSF) {
            allInCases.push({
              name: `${actor.firstName} ${actor.lastName}`,
              country,
              type,
              original: price,
              final: numPrice,
              diff: numPrice - BSF
            });
          }
        }
      }
    }

    if (allInCases.length === 0) {
      console.log("✅ Geen All-in landcampagnes gevonden.");
    } else {
      console.log(`| Voice Actor | Land | Type | Origineel | Na Charm | Tekort vs BSF |`);
      console.log(`| :--- | :--- | :--- | :--- | :--- | :--- |`);
      allInCases.sort((a, b) => a.final - b.final).forEach(g => {
        console.log(`| ${g.name} | ${g.country} | ${g.type} | €${g.original} | **€${g.final}** | ${g.diff} |`);
      });
      console.log(`\n⚠️ Totaal ${allInCases.length} All-in gevallen gevonden.`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

findAllInRates();
