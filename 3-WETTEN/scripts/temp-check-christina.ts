import { db } from '../../1-SITE/packages/database/src/index';
import * as schema from '../../1-SITE/packages/database/src/schema';
import { eq } from 'drizzle-orm';

async function main() {
  if (!db) {
    console.error('DB not available');
    process.exit(1);
  }
  
  const actor = await db.select().from(schema.actors).where(eq(schema.actors.slug, 'christina')).limit(1);
  console.log('ACTOR DATA:');
  console.log(JSON.stringify(actor[0], null, 2));
  
  // Get pricing for 200 words video
  const pricing = await db.select().from(schema.pricing_tiers)
    .where(eq(schema.pricing_tiers.market_code, 'be-nl'))
    .limit(10);
  
  console.log('\nPRICING TIERS (be-nl):');
  console.log(JSON.stringify(pricing, null, 2));
  
  process.exit(0);
}

main().catch(console.error);
