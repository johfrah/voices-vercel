import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../1-SITE/apps/web/.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL not found');

const client = postgres(connectionString, { ssl: 'require' });

async function checkSpecificTranslations() {
  console.log('=== THE TRUTH ABOUT SLUG TRANSLATIONS ===\n');
  
  // Question 1: ANY record where translation_key starts with 'slug.'
  console.log('1️⃣ SEARCHING: translation_key LIKE \'slug.%\'');
  const slugKeys = await client`
    SELECT * FROM translations 
    WHERE translation_key LIKE 'slug.%'
    ORDER BY translation_key, lang
  `;
  console.log(`   Found: ${slugKeys.length} records\n`);
  if (slugKeys.length > 0) {
    slugKeys.forEach((row: any) => {
      console.log(`   Key: ${row.translation_key}`);
      console.log(`   Lang: ${row.lang}`);
      console.log(`   Original: "${row.original_text}"`);
      console.log(`   Translated: "${row.translated_text}"`);
      console.log('');
    });
  }
  
  // Question 2: ANY record where translated_text is 'voice/johfrah' or 'stem/johfrah'
  console.log('\n2️⃣ SEARCHING: translated_text = \'voice/johfrah\' OR \'stem/johfrah\'');
  const voiceJohfrah = await client`
    SELECT * FROM translations 
    WHERE translated_text = 'voice/johfrah' 
       OR translated_text = 'stem/johfrah'
    ORDER BY translation_key, lang
  `;
  console.log(`   Found: ${voiceJohfrah.length} records\n`);
  if (voiceJohfrah.length > 0) {
    voiceJohfrah.forEach((row: any) => {
      console.log(`   Key: ${row.translation_key}`);
      console.log(`   Lang: ${row.lang}`);
      console.log(`   Original: "${row.original_text}"`);
      console.log(`   Translated: "${row.translated_text}"`);
      console.log('');
    });
  }
  
  // Question 3: ANY record where translation_key is 'slug.actor.johfrah'
  console.log('\n3️⃣ SEARCHING: translation_key = \'slug.actor.johfrah\'');
  const slugActorJohfrah = await client`
    SELECT * FROM translations 
    WHERE translation_key = 'slug.actor.johfrah'
    ORDER BY lang
  `;
  console.log(`   Found: ${slugActorJohfrah.length} records\n`);
  if (slugActorJohfrah.length > 0) {
    slugActorJohfrah.forEach((row: any) => {
      console.log(`   Key: ${row.translation_key}`);
      console.log(`   Lang: ${row.lang}`);
      console.log(`   Original: "${row.original_text}"`);
      console.log(`   Translated: "${row.translated_text}"`);
      console.log('');
    });
  }
  
  // Bonus: Let's also check if there are ANY translations with 'johfrah' anywhere
  console.log('\n🔍 BONUS: ANY record containing "johfrah" in ANY field');
  const anyJohfrah = await client`
    SELECT * FROM translations 
    WHERE translation_key LIKE '%johfrah%'
       OR original_text LIKE '%johfrah%'
       OR translated_text LIKE '%johfrah%'
    ORDER BY translation_key, lang
  `;
  console.log(`   Found: ${anyJohfrah.length} records\n`);
  if (anyJohfrah.length > 0) {
    anyJohfrah.forEach((row: any) => {
      console.log(`   Key: ${row.translation_key}`);
      console.log(`   Lang: ${row.lang}`);
      console.log(`   Original: "${row.original_text}"`);
      console.log(`   Translated: "${row.translated_text}"`);
      console.log('');
    });
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Records with translation_key LIKE 'slug.%': ${slugKeys.length}`);
  console.log(`Records with translated_text = 'voice/johfrah' OR 'stem/johfrah': ${voiceJohfrah.length}`);
  console.log(`Records with translation_key = 'slug.actor.johfrah': ${slugActorJohfrah.length}`);
  console.log(`Records containing 'johfrah' anywhere: ${anyJohfrah.length}`);
  
  await client.end();
}

checkSpecificTranslations().catch(console.error);
