
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { actors } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function verifyRegionalWithSql() {
  console.log(`🔍 Verifiëren van regionale tarieven met de originele SQL dump...\n`);

  const sqlPath = path.join(process.cwd(), '4-KELDER/CONTAINER/ID348299_voices.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error("❌ SQL dump niet gevonden op pad:", sqlPath);
    process.exit(1);
  }

  try {
    const allActors = await db.select().from(actors);
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log(`| Voice Actor | WP ID | Type | Huidige DB | Originele SQL | Status |`);
    console.log(`| :--- | :--- | :--- | :--- | :--- | :--- |`);

    for (const actor of allActors) {
      if (!actor.wpProductId) continue;
      
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [country, countryRates] of Object.entries(rates)) {
        if (typeof countryRates !== 'object') continue;

        for (const [type, price] of Object.entries(countryRates)) {
          if (!type.includes('regional') && !type.includes('local') && type !== 'podcast') continue;
          
          const numPrice = parseFloat(price as string);
          if (numPrice <= 0) continue;

          // Zoek in SQL naar dit specifieke tarief voor deze actor
          // We zoeken naar meta_key die overeenkomt met het type
          // De mapping is vaak be_price_radio_regional etc.
          const metaKey = `${country.toLowerCase()}_price_${type}`;
          const legacyMetaKey = `price_${type}`; // Soms zonder land-prefix in oude SQL
          
          const regex = new RegExp(`\\(${actor.wpProductId},[^,]*'(${metaKey}|${legacyMetaKey})',[^,]*'([^']*)'\\)`, 'g');
          const matches = [...sqlContent.matchAll(regex)];
          
          const sqlValue = matches.length > 0 ? matches[0][2] : "NIET GEVONDEN";
          const isMatch = sqlValue === price.toString() || (sqlValue === "NIET GEVONDEN" && price === 250);

          if (numPrice === 250 || numPrice === 450 || sqlValue === "NIET GEVONDEN") {
            console.log(`| ${actor.firstName} | ${actor.wpProductId} | ${country} ${type} | **€${price}** | ${sqlValue === "NIET GEVONDEN" ? "❌" : "€" + sqlValue} | ${isMatch ? "✅ Match" : "⚠️ AFWIJKING"} |`);
          }
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

verifyRegionalWithSql();
