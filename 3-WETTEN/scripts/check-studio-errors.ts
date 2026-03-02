import { db } from '../../1-SITE/packages/database/src/client.js';
import { sql } from 'drizzle-orm';

async function checkStudioErrors() {
  try {
    const result = await db.execute(sql`
      SELECT 
        event_id,
        event_type,
        severity,
        message,
        context,
        created_at
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '2 hours'
        AND (
          message ILIKE '%studio%'
          OR context::text ILIKE '%studio%'
          OR severity IN ('error', 'critical')
        )
      ORDER BY created_at DESC
      LIMIT 30
    `);

    console.log('=== RECENT STUDIO-RELATED ERRORS ===\n');
    
    if (result.rows.length === 0) {
      console.log('No studio-related errors found in the last 2 hours.');
    } else {
      result.rows.forEach((row: any) => {
        console.log(`[${row.created_at}] ${row.severity.toUpperCase()}`);
        console.log(`Type: ${row.event_type}`);
        console.log(`Message: ${row.message}`);
        if (row.context) {
          console.log(`Context: ${JSON.stringify(row.context, null, 2)}`);
        }
        console.log('---\n');
      });
    }

    // Also check all recent critical errors
    const criticalResult = await db.execute(sql`
      SELECT 
        event_id,
        event_type,
        severity,
        message,
        context,
        created_at
      FROM system_events
      WHERE created_at > NOW() - INTERVAL '30 minutes'
        AND severity IN ('error', 'critical')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n=== ALL RECENT CRITICAL ERRORS (Last 30 min) ===\n');
    
    if (criticalResult.rows.length === 0) {
      console.log('No critical errors found in the last 30 minutes.');
    } else {
      criticalResult.rows.forEach((row: any) => {
        console.log(`[${row.created_at}] ${row.severity.toUpperCase()}`);
        console.log(`Type: ${row.event_type}`);
        console.log(`Message: ${row.message}`);
        if (row.context) {
          console.log(`Context: ${JSON.stringify(row.context, null, 2)}`);
        }
        console.log('---\n');
      });
    }

  } catch (error) {
    console.error('Error checking system events:', error);
    process.exit(1);
  }
}

checkStudioErrors().then(() => process.exit(0));
