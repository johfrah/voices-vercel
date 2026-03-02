import postgres from 'postgres';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * 🕵️ NUCLEAR SOURCE HEALER (2026)
 * 
 * Scans the translation_registry for texts that are NOT in Dutch.
 * If found, it translates them back to Dutch to ensure the "Source of Truth" is correct.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */

async function healSourceRegistry() {
  console.log('🚀 STARTING NUCLEAR SOURCE HEALER...');

  // 1. Fetch all registry items (or a subset for testing)
  const items = await sql`
    SELECT id, string_hash, original_text 
    FROM translation_registry 
    WHERE original_text IS NOT NULL AND length(original_text) > 10
    ORDER BY last_seen DESC
    LIMIT 100
  `;

  console.log(`🔍 Scanning ${items.length} items for language mismatches...`);

  for (const item of items) {
    try {
      // Skip knowledge items that are specifically meant to be in English/French for the AI brain
      if (item.string_hash.startsWith('knowledge.') && (item.original_text.includes('MARKET DNA') || item.original_text.includes('GLOSSARY'))) {
        console.log(`⏩ SKIPPING KNOWLEDGE ITEM [${item.string_hash}]`);
        continue;
      }

      // 2. Detect Language & Translate if needed via Gemini
      const prompt = `
        You are a language auditor for Voices.be. 
        Your task:
        1. Detect the language of the provided text.
        2. If it is NOT Dutch (NL), translate it to Dutch.
        3. Return a JSON object: { "detected_lang": "iso-code", "is_dutch": boolean, "dutch_version": "string" }
        
        STRICT RULES:
        - If it IS Dutch, dutch_version should be the same as input.
        - Warm, professional tone.
        - No AI-slop.

        TEXT TO AUDIT:
        ${item.original_text}
      `;

      const resultRaw = await model.generateContent(prompt);
      const resultText = resultRaw.response.text().trim().replace(/```json|```/g, '').trim();
      const result = JSON.parse(resultText);

      if (!result.is_dutch && result.detected_lang !== 'nl') {
        console.log(`⚠️ MISMATCH DETECTED [${item.string_hash}]`);
        console.log(`   Detected: ${result.detected_lang}`);
        console.log(`   Original: "${item.original_text.substring(0, 50)}..."`);
        console.log(`   Healed (NL): "${result.dutch_version.substring(0, 50)}..."`);

        // 3. Update Registry with the Dutch version as the new Source of Truth
        await sql`
          UPDATE translation_registry 
          SET original_text = ${result.dutch_version}
          WHERE id = ${item.id}
        `;

        // 4. Also register the original non-dutch text as a translation for its own language
        // This ensures we don't lose the original input.
        await sql`
          INSERT INTO translations (translation_key, lang, original_text, translated_text, is_manually_edited)
          VALUES (${item.string_hash}, ${result.detected_lang}, ${result.dutch_version}, ${item.original_text}, true)
          ON CONFLICT (translation_key, lang) DO UPDATE 
          SET translated_text = EXCLUDED.translated_text, is_manually_edited = true
        `;

        console.log(`✅ HEALED & REGISTERED [${result.detected_lang}]`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${item.string_hash}:`, err);
    }
  }

  console.log('🏁 NUCLEAR SOURCE HEALER COMPLETED.');
  process.exit(0);
}

healSourceRegistry().catch(console.error);
