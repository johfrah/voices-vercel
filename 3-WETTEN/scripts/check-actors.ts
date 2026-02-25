import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

import { db } from './1-SITE/apps/web/src/lib/sync/bridge';
import { actors } from './1-SITE/packages/database/src/schema/index';
import { count, eq } from 'drizzle-orm';

async function checkActors() {
  try {
    const total = await db.select({ value: count() }).from(actors);
    console.log('Total actors:', total[0].value);

    const live = await db.select({ value: count() }).from(actors).where(eq(actors.status, 'live'));
    console.log('Live actors:', live[0].value);

    const statuses = await db.select({ status: actors.status, count: count() }).from(actors).groupBy(actors.status);
    console.log('Actor statuses:', statuses);

    const firstFive = await db.select({ id: actors.id, firstName: actors.firstName, status: actors.status }).from(actors).limit(5);
    console.log('First 5 actors:', firstFive);

  } catch (e) {
    console.error('Error checking actors:', e);
  }
  process.exit(0);
}

checkActors();
