import { GeminiService } from './src/lib/services/gemini-service';
import { SlopFilter } from './src/lib/engines/slop-filter';
import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function healWithSiteLogic(key: string) {
  console.log(`🚀 HEALING VIA SITE LOGIC (CHRIS-PROTOCOL): ${key}`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch Registry Item
  const { data: item, error: regErr } = await supabase
    .from('translation_registry')
    .select('*')
    .eq('string_hash', key)
    .single();

  if (regErr || !item) {
    console.error("❌ Key not found in registry.");
    return;
  }

  const targetLanguages = ['en', 'fr', 'de', 'es', 'pt'];
  const gemini = GeminiService.getInstance();

  for (const lang of targetLanguages) {
    console.log(`⚖️ Healing: ${key} -> ${lang}`);

    try {
      // Mark as healing
      await supabase.from('translations').upsert({
        translation_key: item.string_hash,
        lang: lang,
        original_text: item.original_text,
        translated_text: '...',
        status: 'healing',
        updated_at: new Date()
      }, { onConflict: 'translation_key, lang' });

      // 2. Fetch Market DNA via Site Logic
      const dna = await gemini.getMarketDNA(lang);
      
      // 3. Use Site Prompt & Gemini Instance
      const prompt = `
        Senior translator for Voices. Translate from NL to ${lang}.
        MARKET DNA: ${dna}
        CONTEXT: ${item.context || 'General UI'}
        TEKST: "${item.original_text}"
        OUTPUT: Translated text only. No quotes. No expansion.
      `;

      const translatedText = await gemini.generateText(prompt);
      const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

      // 4. Slop Filter Check via Site Logic
      if (SlopFilter.isSlop(cleanTranslation, lang, item.original_text)) {
        console.warn(`❌ Slop detected for ${lang}`);
        continue;
      }

      // 5. Save via SDK (matching site logic)
      await supabase.from('translations').upsert({
        translation_key: item.string_hash,
        lang: lang,
        original_text: item.original_text,
        translated_text: cleanTranslation,
        status: 'active',
        updated_at: new Date()
      }, { onConflict: 'translation_key, lang' });

      console.log(`✅ Healed: ${lang}`);
    } catch (err) {
      console.error(`❌ Failed for ${lang}:`, err);
    }
  }
  console.log("🏁 DONE.");
}

const keyToHeal = process.argv[2] || 'review.131.text';
healWithSiteLogic(keyToHeal).catch(console.error);
