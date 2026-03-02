import { GeminiService } from './src/lib/services/gemini-service';
import { SlopFilter } from './src/lib/engines/slop-filter';
import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function nuclearBulkHeal() {
  console.log("🚀 STARTING NUCLEAR BULK HEALING (ID-FIRST)...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const targetLangs = [
    { id: 5, code: 'en-gb' },
    { id: 3, code: 'fr-be' },
    { id: 7, code: 'de-de' },
    { id: 8, code: 'es-es' },
    { id: 12, code: 'pt-pt' },
    { id: 9, code: 'it-it' },
    { id: 2, code: 'nl-nl' }
  ];

  const gemini = GeminiService.getInstance();

  let offset = 0;
  const BATCH_SIZE = 50;

  while (true) {
    console.log(`📡 Fetching batch starting at offset ${offset}...`);
    
    const { data: registryItems, error: regErr } = await supabase
      .from('translation_registry')
      .select('string_hash, original_text, context, source_lang_id')
      .order('last_seen', { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1);

    if (regErr || !registryItems || registryItems.length === 0) {
      console.log("🏁 No more items to process in registry.");
      break;
    }

    for (const item of registryItems) {
      for (const target of targetLangs) {
        if (target.id === item.source_lang_id) continue;

        // Check if translation exists and is valid
        const { data: existing } = await supabase
          .from('translations')
          .select('id, translated_text')
          .eq('translation_key', item.string_hash)
          .eq('lang_id', target.id)
          .maybeSingle();

        if (!existing || !existing.translated_text || existing.translated_text === '...' || existing.translated_text.length < 2) {
          console.log(`⚖️ Healing: ${item.string_hash} -> ${target.code}`);
          
          try {
            // Get Market DNA (with fallback if ETIMEDOUT occurs)
            let dna = "";
            try {
              dna = await gemini.getMarketDNA(target.code);
            } catch (dnaErr) {
              console.warn(`⚠️ DNA fetch failed for ${target.code}, using default context.`);
            }

            const prompt = `
              Senior translator for Voices. Translate from NL to ${target.code}.
              MARKET DNA: ${dna}
              CONTEXT: ${item.context || 'General UI'}
              TEKST: "${item.original_text}"
              OUTPUT: Translated text only. No quotes. No expansion.
            `;

            const translatedText = await gemini.generateText(prompt);
            const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

            if (cleanTranslation && !SlopFilter.isSlop(cleanTranslation, target.code, item.original_text)) {
              await supabase.from('translations').upsert({
                translation_key: item.string_hash,
                lang: target.code,
                lang_id: target.id,
                original_text: item.original_text,
                translated_text: cleanTranslation,
                status: 'active',
                updated_at: new Date()
              }, { onConflict: 'translation_key, lang' });
              
              console.log(`✅ Success: ${target.code}`);
            }
          } catch (e) {
            console.error(`❌ Error for ${target.code}:`, e.message);
          }
          // Slow down to respect Gemini rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    offset += BATCH_SIZE;
    // Optional: add a small break between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("🏁 NUCLEAR HEALING COMPLETED.");
}

nuclearBulkHeal().catch(console.error);
