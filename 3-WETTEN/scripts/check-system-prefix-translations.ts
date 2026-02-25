import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function checkSystemPrefixTranslations() {
  console.log('=== SYSTEM PREFIX TRANSLATIONS CHECK ===\n');
  console.log('Query: SELECT * FROM translations WHERE translation_key LIKE \'slug.prefix.%\' OR translated_text IN (\'voice\', \'stem\', \'voix\', \'artist\', \'artiest\', \'studio\', \'academy\') LIMIT 100;\n');
  
  const results = await client`
    SELECT * FROM translations 
    WHERE translation_key LIKE 'slug.prefix.%' 
       OR translated_text IN ('voice', 'stem', 'voix', 'artist', 'artiest', 'studio', 'academy')
    ORDER BY translation_key, lang
    LIMIT 100
  `;

  console.log(`Total records found: ${results.length}\n`);

  if (results.length === 0) {
    console.log('❌ NO RESULTS FOUND');
    console.log('\nThis means:');
    console.log('  - No translation keys matching "slug.prefix.%"');
    console.log('  - No translated_text values matching the system prefixes (voice, stem, voix, artist, artiest, studio, academy)');
    await client.end();
    return;
  }

  // Group by translation_key for better readability
  const grouped = results.reduce((acc: any, row: any) => {
    if (!acc[row.translation_key]) {
      acc[row.translation_key] = [];
    }
    acc[row.translation_key].push(row);
    return acc;
  }, {});

  console.log('=== RESULTS GROUPED BY TRANSLATION KEY ===\n');
  
  Object.keys(grouped).sort().forEach((key) => {
    console.log(`📌 ${key}`);
    grouped[key].forEach((row: any) => {
      console.log(`   [${row.lang}] → original: "${row.original_text}" | translated: "${row.translated_text}"`);
    });
    console.log('');
  });

  // Show raw table format
  console.log('\n=== RAW TABLE FORMAT ===\n');
  console.log('ID | Translation Key | Lang | Original Text | Translated Text');
  console.log('-'.repeat(100));
  results.forEach((row: any) => {
    console.log(`${row.id} | ${row.translation_key} | ${row.lang} | ${row.original_text} | ${row.translated_text}`);
  });

  await client.end();
}

checkSystemPrefixTranslations().catch(console.error);
