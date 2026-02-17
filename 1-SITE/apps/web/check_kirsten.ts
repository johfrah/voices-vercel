import { db } from './src/lib/sync/bridge.ts';
import { actors } from '../../packages/database/schema.ts';
import { ilike } from 'drizzle-orm';

async function checkKirsten() {
  console.log("🔍 Checking Kirsten in database...");
  try {
    const results = await db.select({
      id: actors.id,
      firstName: actors.firstName,
      lastName: actors.lastName,
      slug: actors.slug
    })
    .from(actors)
    .where(ilike(actors.firstName, 'Kirsten%'));

    console.log("Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Database error:", error);
  }
}

checkKirsten().catch(console.error);
