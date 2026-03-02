const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '1-SITE/apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function healMissingTranslations() {
  console.log("🚀 STARTING HEALING PROCESS (ID-FIRST REALITY)...");

  // 1. Get all entries from registry
  const { data: registry } = await supabase
    .from('translation_registry')
    .select('string_hash, original_text, context, source_lang_id')
    .order('last_seen', { ascending: false })
    .limit(100); // Batches of 100

  if (!registry) {
    console.log("❌ No registry entries found.");
    return;
  }

  // 2. Define all target languages from our Handshake ID Truth
  const allLangs = [
    { id: 1, code: 'nl-be', name: 'Dutch (Flanders)' },
    { id: 2, code: 'nl-nl', name: 'Dutch (Netherlands)' },
    { id: 3, code: 'fr', name: 'French' },
    { id: 5, code: 'en', name: 'English' },
    { id: 7, code: 'de', name: 'German' },
    { id: 8, code: 'es', name: 'Spanish' },
    { id: 12, code: 'pt', name: 'Portuguese' },
    { id: 13, code: 'it', name: 'Italian' }
  ];

  for (const item of registry) {
    const { string_hash: key, original_text: sourceText, context, source_lang_id } = item;
    
    if (!sourceText || sourceText.length < 2) continue;

    // Determine source language name for the prompt
    const sourceLangObj = allLangs.find(l => l.id === source_lang_id) || allLangs[0];

    for (const targetLang of allLangs) {
      // RULE: Skip if target is the source language
      if (targetLang.id === source_lang_id) continue;

      // Check if translation already exists
      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('translation_key', key)
        .eq('lang_id', targetLang.id)
        .maybeSingle();

      if (!existing) {
        console.log(`⚖️ Healing: ${key} (${sourceLangObj.code} -> ${targetLang.code})`);
        
        const prompt = `
          Translate the following text from ${sourceLangObj.name} to ${targetLang.name}.
          Context: ${context || 'General website content for a high-end voice-over agency'}
          Tone of Voice: Professional, warm, high-end, craftsmanship.
          Rules: No em-dashes, no AI-typical filler words. Keep it concise.
          
          Text to translate: "${sourceText}"
          Translation:
        `;

        try {
          const result = await model.generateContent(prompt);
          const translatedText = result.response.text().trim().replace(/^"|"$/g, '');

          if (translatedText && translatedText.length > 0) {
            const { error: insertError } = await supabase.from('translations').insert({
              translation_key: key,
              lang: targetLang.code,
              lang_id: targetLang.id,
              original_text: sourceText,
              translated_text: translatedText,
              status: 'active',
              is_manually_edited: false
            });

            if (insertError) {
              if (insertError.code !== '23505') { // Ignore unique constraint violations
                console.error(`❌ DB Error for ${key}:`, insertError.message);
              }
            } else {
              console.log(`✅ Healed: ${key} (${targetLang.code})`);
            }
          }
        } catch (err) {
          console.error(`❌ Failed ${key} (${targetLang.code}):`, err.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
      }
    }
  }

  console.log("\n🏁 HEALING COMPLETED.");
}

healMissingTranslations().catch(console.error);
