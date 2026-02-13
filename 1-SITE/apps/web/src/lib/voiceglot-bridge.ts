import { db } from '@db';
import { translations } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// 🛡️ CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * NUCLEAR VOICEGLOT BRIDGE - 2026 EDITION
 * 
 * Deze service vervangt de PHP voices_t() API volledig.
 * Het haalt real-time vertalingen uit de Supabase 'translations' tabel.
 */

export class VoiceglotBridge {
  private static cache: Record<string, string> = {};

  /**
   * Vertaalt een string op basis van een key of de originele tekst
   */
  static async t(textOrKey: string, lang: string = 'nl', isKey: boolean = false): Promise<string> {
    if (lang === 'nl' || !textOrKey) return textOrKey;

    const cacheKey = `${lang}:${textOrKey}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    try {
      const condition = isKey 
        ? eq(translations.translationKey, textOrKey)
        : eq(translations.originalText, textOrKey);

      let result: any = null;
      try {
        const [dbResult] = await db.select()
          .from(translations)
          .where(
            and(
              condition,
              eq(translations.lang, lang)
            )
          )
          .limit(1);
        result = dbResult;
      } catch (dbError) {
        console.warn('⚠️ Voiceglot Drizzle failed, falling back to SDK');
        const query = supabase.from('translations').select('*').eq('lang', lang);
        if (isKey) query.eq('translation_key', textOrKey);
        else query.eq('original_text', textOrKey);
        
        const { data } = await query.single();
        if (data) {
          result = {
            ...data,
            translationKey: data.translation_key,
            originalText: data.original_text,
            translatedText: data.translated_text
          };
        }
      }

      const translated = result?.translatedText || textOrKey;
      
      this.cache[cacheKey] = translated;
      return translated;
    } catch (e) {
      console.error('❌ Voiceglot Error:', e);
      return textOrKey;
    }
  }

  /**
   * Batch vertaling voor betere performance
   */
  static async translateBatch(texts: string[], lang: string = 'nl'): Promise<Record<string, string>> {
    if (lang === 'nl') {
      return texts.reduce((acc, text) => ({ ...acc, [text]: text }), {});
    }

    try {
      let results: any[] = [];
      try {
        results = await db.select()
          .from(translations)
          .where(eq(translations.lang, lang));
      } catch (dbError) {
        console.warn('⚠️ Voiceglot Batch Drizzle failed, falling back to SDK');
        const { data } = await supabase.from('translations').select('*').eq('lang', lang);
        results = (data || []).map(r => ({
          ...r,
          originalText: r.original_text,
          translatedText: r.translated_text
        }));
      }

      const translationMap: Record<string, string> = {};
      results.forEach(r => {
        if (r.originalText) {
          translationMap[r.originalText] = r.translatedText || '';
        }
      });

      return texts.reduce((acc, text) => ({
        ...acc,
        [text]: translationMap[text] || text
      }), {});

    } catch (e) {
      return {};
    }
  }
}
