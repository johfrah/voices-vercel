import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkActors() {
  try {
    const result = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'live') as live_count,
        COUNT(*) FILTER (WHERE is_public = true) as public_count,
        COUNT(*) FILTER (WHERE status = 'live' AND is_public = true) as visible_count
      FROM voice_actors
    `);

    console.log('Actor Status:', result.rows[0]);

    // Get a sample of visible actors
    const sample = await db.execute(sql`
      SELECT slug, first_name, last_name, status, is_public
      FROM voice_actors
      WHERE status = 'live' AND is_public = true
      LIMIT 5
    `);

    console.log('\nSample of visible actors:');
    sample.rows.forEach((actor: any) => {
      console.log(`  - ${actor.first_name} ${actor.last_name} (${actor.slug})`);
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
  process.exit(0);
}

checkActors();
