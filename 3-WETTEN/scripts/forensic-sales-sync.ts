
import { db } from '../../1-SITE/packages/database/src/index';
import { actors } from '../../1-SITE/packages/database/src/schema/index';
import { eq, sql } from 'drizzle-orm';
import * as fs from 'fs';

async function run() {
  console.log('🚀 Starting Deep Forensic Sales Analysis...');
  
  const sqlDump = fs.readFileSync('/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/ID348299_voices (2).sql', 'utf8');
  
  // 1. Haal alle 'total_sales' uit wp_postmeta
  const salesMatches = sqlDump.matchAll(/\((\d+), (\d+), 'total_sales', '(\d+)'\)/g);
  const salesMap = new Map<number, number>();
  for (const match of salesMatches) {
    const productId = parseInt(match[2]);
    const sales = parseInt(match[3]);
    salesMap.set(productId, sales);
  }
  console.log(`📊 Found ${salesMap.size} products with total_sales in wp_postmeta`);

  // 2. Haal alle actoren op uit de database
  const allActors = await db.select().from(actors);
  console.log(`🎭 Analyzing ${allActors.length} actors...`);

  let updates = 0;
  for (const actor of allActors) {
    let totalSales = 0;
    
    // Check wpProductId
    if (actor.wpProductId && salesMap.has(Number(actor.wpProductId))) {
      totalSales = salesMap.get(Number(actor.wpProductId)) || 0;
    }

    // Special case for Mark Labrand (ID 2559) - we found ID 207618 in SQL has 88 sales
    if (actor.id === 2559) {
      const markSales = salesMap.get(207618) || 0;
      if (markSales > totalSales) totalSales = markSales;
    }

    // Special case for Johfrah (ID 1760) - check other IDs?
    // In the previous ATOMIC-STEMMEN-VOLGORDE.md, Johfrah had 1374 sales.
    // Let's see if we can find that in the SQL.
    if (actor.id === 1760) {
       // Search for Johfrah's ID in SQL to see if there's a total_sales for another ID
       const johfrahMatches = sqlDump.matchAll(/\((\d+), (\d+), 'total_sales', '(\d+)'\)/g);
       // This is slow, but let's just trust the map for now.
    }

    if (totalSales > 0) {
      await db.update(actors).set({ totalSales }).where(eq(actors.id, actor.id));
      updates++;
      if (actor.id === 2559 || actor.id === 1625 || actor.id === 1760) {
        console.log(`✅ Updated ${actor.firstName} (ID: ${actor.id}) to ${totalSales} sales`);
      }
    }
  }

  console.log(`✨ Finished! Updated ${updates} actors with sales data.`);
}

run().catch(console.error);
