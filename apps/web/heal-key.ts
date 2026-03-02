const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function healSpecificKey(key) {
  console.log(`🚀 HEALING SPECIFIC KEY: ${key}`);

  const { data: item, error: regErr } = await supabase
    .from('translation_registry')
    .select('string_hash, original_text, context, source_lang_id')
    .eq('string_hash', key)
    .single();

  if (regErr || !item) {
    console.error("❌ Key not found in registry.");
    return;
  }

  const allLangs = [
    { id: 1, code: 'nl-be', name: 'Dutch (Flanders)' },
    { id: 2, code: 'nl-nl', name: 'Dutch (Netherlands)' },
    { id: 3, code: 'fr-be', name: 'French (Belgium)' },
    { id: 5, code: 'en-gb', name: 'English (UK)' },
    { id: 7, code: 'de-de', name: 'German' },
    { id: 8, code: 'es-es', name: 'Spanish' },
    { id: 12, code: 'pt-pt', name: 'Portuguese' },
    { id: 9, code: 'it-it', name: 'Italian' }
  ];

  const sourceLangObj = allLangs.find(l => l.id === item.source_lang_id) || allLangs[0];

  for (const targetLang of allLangs) {
    if (targetLang.id === item.source_lang_id) continue;

    console.log(`⚖️ Healing: ${key} (${sourceLangObj.code} -> ${targetLang.code})`);
    
    const prompt = `
      Translate the following text from ${sourceLangObj.name} to ${targetLang.name}.
      Context: ${item.context || 'Customer review for a high-end voice-over agency'}
      Tone of Voice: Professional, warm, high-end, craftsmanship.
      Rules: No em-dashes, no AI-typical filler words. Keep it concise.
      
      Text to translate: "${item.original_text}"
      Translation:
    `;

    try {
      const result = await model.generateContent(prompt);
      const translatedText = result.response.text().trim().replace(/^"|"$/g, '');

      if (translatedText) {
        const { error: upsertError } = await supabase.from('translations').upsert({
          translation_key: key,
          lang: targetLang.code,
          lang_id: targetLang.id,
          original_text: item.original_text,
          translated_text: translatedText,
          status: 'active',
          is_manually_edited: false,
          updated_at: new Date()
        }, { onConflict: 'translation_key,lang' });

        if (upsertError) console.error(`❌ DB Error for ${targetLang.code}:`, upsertError.message);
        else console.log(`✅ Healed: ${targetLang.code}`);
      }
    } catch (err) {
      console.error(`❌ Failed ${targetLang.code}:`, err.message);
    }
  }
  console.log("🏁 DONE.");
}

const keyToHeal = process.argv[2] || 'review.131.text';
healSpecificKey(keyToHeal).catch(console.error);
