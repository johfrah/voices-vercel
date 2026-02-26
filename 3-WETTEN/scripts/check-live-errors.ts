import { db } from '../../1-SITE/packages/database/src/db';
import { sql } from 'drizzle-orm';

async function checkLiveErrors() {
  console.log('🔍 Checking for recent errors on live...\n');
  
  const result = await db.execute(sql`
    SELECT COUNT(*) as count, severity, error_type, message
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '1 hour'
    AND severity IN ('error', 'critical')
    GROUP BY severity, error_type, message
    ORDER BY count DESC
    LIMIT 10
  `);
  
  if (result.rows.length === 0) {
    console.log('✅ 0 TypeErrors on live (last hour)');
    console.log('✅ No critical errors detected');
    process.exit(0);
  } else {
    console.log('❌ Errors detected:');
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(1);
  }
}

checkLiveErrors().catch(err => {
  console.error('Failed to check errors:', err);
  process.exit(1);
});
