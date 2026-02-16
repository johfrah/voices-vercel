import { db } from './src/db';
import { actors } from './packages/database/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkProps() {
  try {
    const results = await db.select().from(actors).where(eq(actors.id, 1355)).limit(1);
    if (results.length > 0) {
      console.log('--- Drizzle Actor Object ---');
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      console.log('Actor 1355 not found via Drizzle');
    }
  } catch (e) {
    console.error('Drizzle error:', e);
  }
}

checkProps();
