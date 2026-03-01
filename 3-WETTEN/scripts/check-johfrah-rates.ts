import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  // Check if Johfrah actor exists
  const actorResult = await db.execute(sql`
    SELECT id, first_name, last_name, slug, rates, status
    FROM actors
    WHERE slug = 'johfrah' OR first_name ILIKE '%johfrah%' OR last_name ILIKE '%johfrah%'
    LIMIT 5
  `);

  console.log('\nActors with "johfrah":');
  console.log(JSON.stringify(actorResult, null, 2));
}

main().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
