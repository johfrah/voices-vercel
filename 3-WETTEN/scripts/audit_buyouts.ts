
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { db } from './1-SITE/packages/database/src';

async function auditRates() {
  console.log("🔍 Auditing rates to check for 'Buyout vs Total' consistency...");
  
  try {
    // Select only the fields we need to avoid schema issues
    const allActors = await db.execute(sql`SELECT id, first_name, last_name, rates FROM actors`);
    const dbActors = (allActors.rows || allActors) as any[];
    
    const suspicious: any[] = [];
    const BSF = 249;

    for (const actor of dbActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      for (const [market, marketRates] of Object.entries(rates)) {
        if (typeof marketRates !== 'object' || marketRates === null) continue;
        
        for (const [type, price] of Object.entries(marketRates)) {
          if (type === 'bsf') continue;
          
          const numPrice = parseFloat(price as string);
          if (numPrice > 0 && numPrice < BSF) {
            suspicious.push({
              name: `${actor.first_name} ${actor.last_name}`,
              market,
              type,
              price: numPrice,
              id: actor.id
            });
          }
        }
      }
    }

    if (suspicious.length === 0) {
      console.log("✅ No suspicious rates found (all rates are >= BSF).");
    } else {
      console.log(`⚠️ Found ${suspicious.length} suspicious rates (price < BSF):`);
      console.table(suspicious);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

auditRates();
