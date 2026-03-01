#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/index.js';
import { sql } from 'drizzle-orm';

async function checkRecentErrors() {
  console.log('🔍 Checking for SlimmeKassa errors since v2.18.2 deployment...\n');

  // Check for errors in the last 15 minutes
  const recentErrors = await db.execute(sql`
    SELECT created_at, level, source, message, details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '15 minutes'
    AND (message ILIKE '%SlimmeKassa%' OR message ILIKE '%ReferenceError%')
    ORDER BY created_at DESC
  `);

  const errorRows = Array.isArray(recentErrors) ? recentErrors : (recentErrors.rows || []);
  
  console.log(`Found ${errorRows.length} SlimmeKassa/ReferenceError events (last 15 minutes):`);
  if (errorRows.length > 0) {
    console.log('❌ STILL FAILING - Errors detected:\n');
    errorRows.forEach((row: any) => {
      console.log(`- ${row.created_at}: ${row.message}`);
      if (row.details?.breadcrumbs) {
        const versionCrumb = row.details.breadcrumbs.find((b: any) => b.message?.includes('Nuclear Version'));
        if (versionCrumb) {
          console.log(`  Version: ${versionCrumb.message}`);
        }
      }
    });
  } else {
    console.log('✅ NO ERRORS - SlimmeKassa fix is working!');
  }

  // Check the current version on live
  console.log('\n📊 Checking current live version...');
  const versionLogs = await db.execute(sql`
    SELECT created_at, message, details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '10 minutes'
    AND message ILIKE '%Nuclear Version%'
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const versionRows = Array.isArray(versionLogs) ? versionLogs : (versionLogs.rows || []);
  if (versionRows.length > 0) {
    console.log(`Current live version: ${versionRows[0].message}`);
    console.log(`Last seen: ${versionRows[0].created_at}`);
  }
}

checkRecentErrors().catch(console.error);
