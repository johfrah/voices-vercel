#!/usr/bin/env tsx
import { db } from '../../1-SITE/packages/database/src/client.js';
import { sql } from 'drizzle-orm';

async function checkLanguageErrors() {
  console.log('🔍 Checking for recent language/config errors...\n');

  const events = await db.execute(sql`
    SELECT 
      created_at,
      event_type,
      severity,
      message,
      details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '2 hours'
    AND (
      message ILIKE '%language%'
      OR message ILIKE '%500%'
      OR message ILIKE '%countries%'
      OR message ILIKE '%config%'
      OR event_type = 'api_error'
    )
    ORDER BY created_at DESC
    LIMIT 30
  `);

  if (events.rows.length === 0) {
    console.log('✅ No language or config errors found in the last 2 hours.');
  } else {
    console.log(`⚠️  Found ${events.rows.length} events:\n`);
    events.rows.forEach((event: any) => {
      console.log(`[${event.created_at}] ${event.severity} - ${event.event_type}`);
      console.log(`Message: ${event.message}`);
      if (event.details) {
        console.log(`Details: ${JSON.stringify(event.details, null, 2)}`);
      }
      console.log('---');
    });
  }

  // Also check the current languages in the database
  console.log('\n🌍 Checking language data...\n');
  const languages = await db.execute(sql`
    SELECT language_code, language_name_native, language_name_en
    FROM languages
    ORDER BY language_code
    LIMIT 10
  `);

  console.log('Sample languages in database:');
  languages.rows.forEach((lang: any) => {
    console.log(`  ${lang.language_code}: ${lang.language_name_native} (${lang.language_name_en})`);
  });
}

checkLanguageErrors().catch(console.error);
