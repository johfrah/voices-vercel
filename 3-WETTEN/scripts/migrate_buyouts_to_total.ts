
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { sql } from 'drizzle-orm';
import { db } from './1-SITE/packages/database/src';

async function migrateBuyouts() {
  console.log("🚀 START: Buyout Migration (BSF + Buyout logic for National/Online)...");
  
  const BSF = 249;
  const nationalTypes = ['tv_national', 'radio_national', 'online', 'podcast', 'social_media'];

  try {
    const allActors = await db.execute(sql`SELECT id, first_name, last_name, rates FROM actors`);
    const dbActors = (allActors.rows || allActors) as any[];
    
    let totalUpdated = 0;
    let totalEntriesFixed = 0;

    for (const actor of dbActors) {
      const rates = actor.rates as Record<string, any>;
      if (!rates) continue;

      let hasChanges = false;
      const newRates = JSON.parse(JSON.stringify(rates));

      for (const [market, marketRates] of Object.entries(newRates)) {
        if (typeof marketRates !== 'object' || marketRates === null) continue;
        
        for (const [type, price] of Object.entries(marketRates)) {
          if (nationalTypes.includes(type)) {
            const numPrice = parseFloat(price as string);
            
            if (numPrice > 0 && numPrice < BSF) {
              const newTotal = numPrice + BSF;
              console.log(`✨ Fixing ${actor.first_name} ${actor.last_name} | ${market} | ${type}: €${numPrice} -> €${newTotal} (Total)`);
              newRates[market][type] = newTotal;
              hasChanges = true;
              totalEntriesFixed++;
            }
          }
        }
      }

      if (hasChanges) {
        // Use raw SQL for update to avoid type issues in script
        await db.execute(sql`
          UPDATE actors 
          SET rates = ${JSON.stringify(newRates)} 
          WHERE id = ${actor.id}
        `);
        totalUpdated++;
      }
    }

    console.log(`\n✅ MIGRATIE VOLTOOID!`);
    console.log(`📊 Aantal stemmen aangepast: ${totalUpdated}`);
    console.log(`📊 Aantal tarieven gecorrigeerd: ${totalEntriesFixed}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migratie gefaald:", error);
    process.exit(1);
  }
}

migrateBuyouts();
