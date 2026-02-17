
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '1-SITE/apps/web/.env.local');
dotenv.config({ path: envPath });

import { db } from '../../1-SITE/packages/database/src';
import { actors } from '../../1-SITE/packages/database/src/schema';

async function checkAnnelies() {
  const allActors = await db.select().from(actors);
  const actor = allActors.find(a => a.wpProductId === 228397);

  if (actor) {
    console.log('Annelies (WP: 228397):');
    console.log('priceOnline (standard column):', actor.priceOnline);
    console.log('Rates JSON:', JSON.stringify(actor.rates, null, 2));
  } else {
    console.log('Annelies not found');
  }
  process.exit(0);
}

checkAnnelies();
