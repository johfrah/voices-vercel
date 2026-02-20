
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

import { eq } from 'drizzle-orm';
import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function nukeFlatToJson() {
  console.log('🚀 Starting Nuclear Flat-to-JSON Migration...');

  try {
    const allActors = await db.select().from(actors);
    let updatedCount = 0;

    for (const actor of allActors) {
      // Initialize rates if it doesn't exist
      const rates = (actor.rates as Record<string, any>) || {};
      if (!rates.GLOBAL) rates.GLOBAL = {};
      if (!rates.global) rates.global = {}; // Support both casings just in case

      let hasChanges = false;

      // 1. Migrate price_unpaid (Video) -> unpaid
      const unpaidPrice = parseFloat(String(actor.priceUnpaid || 0));
      if (unpaidPrice > 0) {
        rates.GLOBAL.unpaid = unpaidPrice;
        hasChanges = true;
        console.log(`📍 [${actor.firstName}] Mapping price_unpaid (€${unpaidPrice}) to JSON`);
      }

      // 2. Migrate price_ivr (Telephony) -> ivr
      const ivrPrice = parseFloat(String(actor.priceIvr || 0));
      if (ivrPrice > 0) {
        rates.GLOBAL.ivr = ivrPrice;
        hasChanges = true;
        console.log(`📍 [${actor.firstName}] Mapping price_ivr (€${ivrPrice}) to JSON`);
      }

      // 3. Migrate price_live_regie (Live Regie) -> live_regie
      const liveRegiePrice = parseFloat(String(actor.priceLiveRegie || 0));
      if (liveRegiePrice > 0) {
        rates.GLOBAL.live_regie = liveRegiePrice;
        hasChanges = true;
        console.log(`📍 [${actor.firstName}] Mapping price_live_regie (€${liveRegiePrice}) to JSON`);
      }

      // 4. Migrate price_online (Commercial Online) -> online (if not already there)
      const onlinePrice = parseFloat(String(actor.priceOnline || 0));
      if (onlinePrice > 0 && !rates.GLOBAL.online) {
        rates.GLOBAL.online = onlinePrice;
        hasChanges = true;
        console.log(`📍 [${actor.firstName}] Mapping price_online (€${onlinePrice}) to JSON`);
      }

      if (hasChanges) {
        await db.update(actors)
          .set({ 
            rates: rates,
            isManuallyEdited: true 
          })
          .where(eq(actors.id as any, actor.id));
        
        updatedCount++;
      }
    }

    console.log(`\n✨ Nuclear Migration complete! Updated ${updatedCount} actors.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Nuclear Migration failed:', error);
    process.exit(1);
  }
}

nukeFlatToJson();
