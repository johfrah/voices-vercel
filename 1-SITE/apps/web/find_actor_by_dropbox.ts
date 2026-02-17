import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './../../packages/database/schema.ts';
import { ilike } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function findActor() {
  console.log("🔍 Finding actor by dropboxUrl containing '189009-birgit-new.png'...");
  try {
    const results = await db.select({
      id: schema.actors.id,
      wpProductId: schema.actors.wpProductId,
      firstName: schema.actors.firstName,
      dropboxUrl: schema.actors.dropboxUrl
    })
    .from(schema.actors)
    .where(ilike(schema.actors.dropboxUrl, '%189009-birgit-new.png%'));

    console.log("Results:", JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Database error:", error);
    process.exit(1);
  }
}

findActor().catch(console.error);
