import { db } from '@db';
import { translations } from '@db/schema';
import { eq, and } from 'drizzle-orm';

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
    if (lang === 'nl') return textOrKey;

    const cacheKey = `${lang}:${textOrKey}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    try {
      const condition = isKey 
        ? eq(translations.translationKey, textOrKey)
        : eq(translations.originalText, textOrKey);

      const [result] = await db.select()
        .from(translations)
        .where(
          and(
            condition,
            eq(translations.lang, lang)
          )
        )
        .limit(1);

      const translated = result?.translatedText || (isKey ? textOrKey : textOrKey);
      
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
      const results = await db.select()
        .from(translations)
        .where(eq(translations.lang, lang));

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
