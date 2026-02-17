
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function inspectRates() {
  try {
    // Fetch a few actors who have rates
    const allActors = await db.select().from(actors);
    // Find an actor who has 'radio' in their rates string
    const results = allActors.filter(a => a.rates && Object.keys(a.rates as object).length > 0).slice(0, 5);
    
    console.log('--- RATES INSPECTION ---');
    for (const actor of results) {
      console.log(`Actor: ${actor.firstName} ${actor.lastName}`);
      console.log(JSON.stringify(actor.rates, null, 2));
      console.log('------------------------');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

inspectRates();
