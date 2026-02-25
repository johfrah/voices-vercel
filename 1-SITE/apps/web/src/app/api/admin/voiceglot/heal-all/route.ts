import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai-service';
import { GeminiService } from '@/lib/services/gemini-service';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { SlopFilter } from '@/lib/engines/slop-filter';
import { createClient } from "@supabase/supabase-js";
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 *  API: VOICEGLOT HEAL-ALL (NUCLEAR SDK 2026)
 * 
 * CHRIS-PROTOCOL: We bypass Drizzle/postgres-js for this long-running 
 * batch process to avoid production driver instability.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, healedCount: 0, message: 'Skipping heal-all during build' });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt'];
    let totalHealed = 0;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    // 1. Fetch Registry Items via SDK
    const { data: registryItems, error: regErr } = await supabase
      .from('translation_registry')
      .select('*');

    if (regErr) throw regErr;
    if (!registryItems) return NextResponse.json({ success: true, healedCount: 0 });

    // 2. Fetch Existing Translations via SDK
    const { data: existingTranslations, error: transErr } = await supabase
      .from('translations')
      .select('translation_key, lang, translated_text, status')
      .in('lang', targetLanguages);

    if (transErr) throw transErr;

    const transMap = new Map();
    (existingTranslations || []).forEach(t => {
      transMap.set(`${t.translation_key}:${t.lang}`, t);
    });

    const itemsToHeal = [];
    for (const item of registryItems) {
      for (const lang of targetLanguages) {
        const existing = transMap.get(`${item.string_hash}:${lang}`);
        if (!existing || !existing.translated_text || existing.translated_text === 'Initial Load' || existing.status === 'healing_failed') {
          itemsToHeal.push({ item, lang });
        }
      }
    }

    // 🛡️ CHRIS-PROTOCOL: Batching Mandate (Reduced to 30 for Edge stability)
    const BATCH_SIZE = 30;
    const itemsToProcess = itemsToHeal.slice(0, BATCH_SIZE);

    console.log(`🚀 [Heal-All SDK] Processing ${itemsToProcess.length} items...`);

    // 3. Cache Market DNA
    const dnaCache: Record<string, string> = {};
    for (const lang of targetLanguages) {
      dnaCache[lang] = await GeminiService.getInstance().getMarketDNA(lang);
    }

    for (const { item, lang } of itemsToProcess) {
      try {
        // Mark as healing via SDK
        await supabase.from('translations').upsert({
          translation_key: item.string_hash,
          lang: lang,
          original_text: item.original_text,
          translated_text: '...',
          status: 'healing',
          updated_at: new Date().toISOString()
        }, { onConflict: 'translation_key, lang' });

        let sourceText = item.original_text;
        
        // Source Language Detection for Bios/Taglines
        if (item.string_hash.includes('.bio') || item.string_hash.includes('.tagline')) {
          const detectionResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Detect language. If not Dutch (NL), translate to Dutch. Return JSON: { \"detected_lang\": \"iso\", \"is_dutch\": bool, \"dutch_version\": \"str\" }" },
              { role: "user", content: item.original_text }
            ],
            response_format: { type: "json_object" }
          });
          const detection = JSON.parse(detectionResponse.choices[0].message.content || '{}');
          
          if (!detection.is_dutch && detection.detected_lang !== 'nl') {
            await supabase.from('translation_registry')
              .update({ original_text: detection.dutch_version })
              .eq('string_hash', item.string_hash);
            
            await supabase.from('translations').upsert({
              translation_key: item.string_hash,
              lang: detection.detected_lang,
              original_text: detection.dutch_version,
              translated_text: item.original_text,
              status: 'active',
              is_manually_edited: true,
              updated_at: new Date().toISOString()
            }, { onConflict: 'translation_key, lang' });
            
            sourceText = detection.dutch_version;
          }
        }

        const dna = dnaCache[lang] || '';
        const prompt = `
          Senior translator for Voices. Translate from NL to ${lang}.
          MARKET DNA: ${dna}
          CONTEXT: ${item.context || 'General UI'}
          TEKST: "${sourceText}"
          OUTPUT: Translated text only. No quotes. No expansion.
        `;

        const translatedText = await OpenAIService.generateText(prompt);
        const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

        if (SlopFilter.isSlop(cleanTranslation, lang, sourceText)) {
          console.warn(`[Heal-All SDK] Slop detected for ${item.string_hash} (${lang})`);
          continue;
        }

        // Save translation via SDK
        await supabase.from('translations').upsert({
          translation_key: item.string_hash,
          lang: lang,
          original_text: sourceText,
          translated_text: cleanTranslation,
          status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'translation_key, lang' });

        totalHealed++;
      } catch (err) {
        console.error(`❌ [Heal-All SDK] Failed for ${item.string_hash} (${lang}):`, err);
        await supabase.from('translations')
          .update({ status: 'healing_failed', updated_at: new Date().toISOString() })
          .match({ translation_key: item.string_hash, lang: lang });
      }
    }

    return NextResponse.json({ 
      success: true, 
      healedCount: totalHealed,
      message: `Nuclear Healing (SDK) voltooid voor ${totalHealed} strings.`
    });

  } catch (error: any) {
    console.error('[API Voiceglot Heal-All SDK Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
