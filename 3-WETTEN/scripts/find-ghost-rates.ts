
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function findGhostRates() {
  console.log(`🔍 Zoeken naar 'Ghost Rates' (ongebruikelijke of verdachte bedragen)...\n`);

  try {
    const allActors = await db.select().from(actors);
    const ghosts: any[] = [];

    // We zoeken naar bedragen die vaak als 'placeholder' of 'default' worden gebruikt
    const SUSPICIOUS_VALUES = [450, 239, 250, 0]; 

    for (const actor of allActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [country, countryRates] of Object.entries(rates)) {
        if (typeof countryRates !== 'object') continue;
        
        for (const [type, price] of Object.entries(countryRates)) {
          const numPrice = parseFloat(price as string);
          
          // 1. Check voor de beruchte €450 placeholder
          if (numPrice === 450) {
            ghosts.push({ name: `${actor.firstName} ${actor.lastName}`, country, type, price: numPrice, reason: 'Mogelijke €450 placeholder' });
          }

          // 1b. Check voor de €250 placeholder
          if (numPrice === 250) {
            ghosts.push({ name: `${actor.firstName} ${actor.lastName}`, country, type, price: numPrice, reason: 'Mogelijke €250 placeholder' });
          }
          
          // 2. Check voor bedragen die exact gelijk zijn aan de oude default (€239)
          if (numPrice === 239 && type !== 'online') {
            ghosts.push({ name: `${actor.firstName} ${actor.lastName}`, country, type, price: numPrice, reason: 'Oude €239 default' });
          }

          // 3. Check voor bedragen die exact €0 zijn (zou 'Prijs op aanvraag' of 'Verborgen' moeten zijn)
          if (price === 0 || price === "0" || price === "0.00") {
            ghosts.push({ name: `${actor.firstName} ${actor.lastName}`, country, type, price: 0, reason: 'Expliciete nul-waarde' });
          }
        }
      }
    }

    if (ghosts.length === 0) {
      console.log("✅ Geen ghost rates gevonden.");
    } else {
      console.log(`| Voice Actor | Land | Type | Prijs | Reden |`);
      console.log(`| :--- | :--- | :--- | :--- | :--- |`);
      ghosts.forEach(g => {
        console.log(`| ${g.name} | ${g.country} | ${g.type} | **€${g.price}** | ${g.reason} |`);
      });
      console.log(`\n⚠️ Totaal ${ghosts.length} verdachte waarden gevonden.`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

findGhostRates();
