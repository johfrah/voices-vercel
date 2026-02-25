import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function checkLanguageLive() {
  console.log('🔍 Checking for recent language/config errors...\n');

  // Check for errors in the last 2 hours
  const events = await client`
    SELECT 
      created_at,
      level,
      source,
      message,
      details
    FROM system_events
    WHERE created_at > NOW() - INTERVAL '2 hours'
    AND (
      message ILIKE '%language%'
      OR message ILIKE '%500%'
      OR message ILIKE '%countries%'
      OR message ILIKE '%config%'
      OR message ILIKE '%Onbekende taal%'
      OR level = 'error'
    )
    ORDER BY created_at DESC
    LIMIT 30
  `;

  if (events.length === 0) {
    console.log('✅ No language or config errors found in the last 2 hours.');
  } else {
    console.log(`⚠️  Found ${events.length} events:\n`);
    events.forEach((event: any) => {
      console.log(`[${event.created_at}] ${event.level} - ${event.source}`);
      console.log(`Message: ${event.message}`);
      if (event.details) {
        console.log(`Details: ${JSON.stringify(event.details, null, 2)}`);
      }
      console.log('---');
    });
  }

  // Check the current languages in the database
  console.log('\n🌍 Checking language data...\n');
  const languages = await client`
    SELECT language_code, language_name_native, language_name_en
    FROM languages
    ORDER BY language_code
    LIMIT 15
  `;

  console.log('Sample languages in database:');
  languages.forEach((lang: any) => {
    console.log(`  ${lang.language_code}: ${lang.language_name_native} (${lang.language_name_en})`);
  });

  // Check a sample actor's languages
  console.log('\n🎭 Checking sample actor languages...\n');
  const actorLangs = await client`
    SELECT 
      a.actor_name,
      a.languages,
      l.language_name_native
    FROM actors a
    LEFT JOIN languages l ON l.language_code = ANY(a.languages)
    WHERE a.status = 'live'
    AND a.is_public = true
    LIMIT 3
  `;

  actorLangs.forEach((actor: any) => {
    console.log(`Actor: ${actor.actor_name}`);
    console.log(`  Languages array: ${JSON.stringify(actor.languages)}`);
    console.log(`  Resolved name: ${actor.language_name_native || 'NOT FOUND'}`);
  });

  await client.end();
}

checkLanguageLive().catch(console.error);
