import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function checkTranslationsSlugs() {
  console.log('=== TRANSLATIONS TABLE: ALL KEYS (SAMPLE) ===\n');
  
  // First, let's see what keys actually exist
  const allKeys = await client`
    SELECT DISTINCT translation_key 
    FROM translations 
    ORDER BY translation_key
    LIMIT 50
  `;
  
  console.log('Sample of translation keys in database:');
  allKeys.forEach((row: any) => {
    console.log(`  - ${row.translation_key}`);
  });
  
  console.log('\n=== SEARCHING FOR VOICE/ACTOR RELATED KEYS ===\n');
  
  const voiceKeys = await client`
    SELECT DISTINCT translation_key 
    FROM translations 
    WHERE translation_key LIKE '%voice%' 
       OR translation_key LIKE '%actor%'
       OR translation_key LIKE '%johfrah%'
    ORDER BY translation_key
    LIMIT 50
  `;
  
  console.log('Voice/Actor related keys:');
  voiceKeys.forEach((row: any) => {
    console.log(`  - ${row.translation_key}`);
  });
  
  // Now let's check if there's a slug field in the actors table
  console.log('\n=== CHECKING ACTORS TABLE FOR SLUG MAPPING ===\n');
  
  const actorSlugs = await client`
    SELECT id, first_name, last_name, slug 
    FROM actors 
    WHERE slug IS NOT NULL
    ORDER BY id
    LIMIT 20
  `;
  
  console.log('Sample actor slugs from database:');
  actorSlugs.forEach((row: any) => {
    console.log(`  ID ${row.id}: ${row.first_name} ${row.last_name} → slug: "${row.slug}"`);
  });
  
  // Check specifically for johfrah
  const johfrah = await client`
    SELECT id, first_name, last_name, slug 
    FROM actors 
    WHERE first_name ILIKE '%johfrah%' OR last_name ILIKE '%johfrah%' OR slug ILIKE '%johfrah%'
    LIMIT 5
  `;
  
  console.log('\n=== JOHFRAH ACTOR DATA ===');
  if (johfrah.length > 0) {
    johfrah.forEach((row: any) => {
      console.log(`  ID ${row.id}: ${row.first_name} ${row.last_name}`);
      console.log(`  Slug: "${row.slug}"`);
      console.log('');
    });
  } else {
    console.log('❌ No actor found with name "johfrah"');
  }
  
  console.log('\n=== TRANSLATIONS TABLE: slug.* KEYS ===\n');
  
  const translations = await client`
    SELECT * FROM translations 
    WHERE translation_key LIKE 'slug.%' 
    ORDER BY translation_key, lang
    LIMIT 100
  `;

  console.log(`Total records found: ${translations.length}\n`);

  if (translations.length > 0) {
    // Group by translation_key for better readability
    const grouped = translations.reduce((acc: any, row: any) => {
      if (!acc[row.translation_key]) {
        acc[row.translation_key] = [];
      }
      acc[row.translation_key].push(row);
      return acc;
    }, {});

    Object.keys(grouped).forEach((key) => {
      console.log(`\n📌 ${key}`);
      grouped[key].forEach((row: any) => {
        console.log(`   [${row.lang}] → original: "${row.original_text}" | translated: "${row.translated_text}"`);
      });
    });

    // Look specifically for voice/johfrah patterns
    console.log('\n\n=== SEARCHING FOR "voice/johfrah" OR SIMILAR PATTERNS ===\n');
    const voicePatterns = translations.filter((row: any) => 
      row.translated_text?.includes('voice/') || 
      row.translated_text?.includes('johfrah') ||
      row.original_text?.includes('voice/') || 
      row.original_text?.includes('johfrah') ||
      row.translation_key?.includes('voice') ||
      row.translation_key?.includes('johfrah')
    );

    if (voicePatterns.length > 0) {
      voicePatterns.forEach((row: any) => {
        console.log(`Key: ${row.translation_key}`);
        console.log(`  Lang: ${row.lang}`);
        console.log(`  Original: ${row.original_text}`);
        console.log(`  Translated: ${row.translated_text}`);
        console.log('');
      });
    } else {
      console.log('❌ No "voice/" or "johfrah" patterns found in slug translations.');
    }
  } else {
    console.log('❌ NO SLUG TRANSLATIONS FOUND');
  }

  await client.end();
}

checkTranslationsSlugs().catch(console.error);
