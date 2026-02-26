import { db } from '@voices/database';
import { sql } from 'drizzle-orm';

async function checkRecentErrors() {
  try {
    const result = await db.execute(sql`
      SELECT 
        created_at,
        event_type,
        severity,
        message,
        context
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '1 hour'
      AND severity IN ('error', 'critical')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('✅ Recent errors (last hour):', result.rows.length);
    if (result.rows.length > 0) {
      console.log(JSON.stringify(result.rows, null, 2));
    } else {
      console.log('No errors found in the last hour.');
    }
  } catch (error) {
    console.error('❌ Failed to check errors:', error);
    process.exit(1);
  }
  process.exit(0);
}

checkRecentErrors();
