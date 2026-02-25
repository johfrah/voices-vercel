
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { orders } from '../../1-SITE/packages/database/schema';
import { db } from '../../1-SITE/packages/database/src';

async function debugOrderMeta() {
  try {
    const sample = await db.select({ 
      id: orders.id, 
      iap: orders.iapContext, 
      raw: orders.rawMeta 
    }).from(orders).limit(10);
    
    console.log("🔍 DEBUG ORDER META SAMPLES:");
    sample.forEach(s => {
      console.log(`\nOrder ID: ${s.id}`);
      console.log(`IAP: ${JSON.stringify(s.iap)}`);
      console.log(`RAW: ${JSON.stringify(s.raw)}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

debugOrderMeta();
