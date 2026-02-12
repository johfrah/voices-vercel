import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { eq } from 'drizzle-orm';
import { GeminiService } from '@/services/GeminiService';
import { NextResponse } from 'next/server';

/**
 * 🚀 API: TURBO HEAL (GOD MODE 2026)
 * 
 * Doel: Forceer AI vertalingen voor alle ontbrekende keys in alle talen.
 */

export async function GET() {
  const targetLanguages = ['fr', 'en', 'de', 'es', 'pt'];
  const results: any = {};

  try {
    const allStrings = await db.select().from(translationRegistry);
    
    for (const lang of targetLanguages) {
      const existing = await db.select({ key: translations.translationKey }).from(translations).where(eq(translations.lang, lang));
      const existingKeys = new Set(existing.map(t => t.key));
      const missing = allStrings.filter(s => !existingKeys.has(s.translationKey));
      
      results[lang] = { total: allStrings.length, missing: missing.length, healed: 0 };

      // We healen er max 10 per keer om timeouts te voorkomen, 
      // de rest gebeurt via de normale self-healing of volgende run.
      for (const item of missing.slice(0, 15)) {
        try {
          const prompt = `Vertaal naar het ${lang}: "${item.defaultText}". Voices Tone: warm, vakmanschap. Max 15 woorden.`;
          const translated = await GeminiService.generateText(prompt);
          const clean = translated.trim().replace(/^"|"$/g, '');

          await db.insert(translations).values({
            translationKey: item.translationKey,
            lang: lang,
            originalText: item.defaultText,
            translatedText: clean,
            status: 'active',
            updatedAt: new Date()
          });
          results[lang].healed++;
        } catch (e) {
          console.error(`Failed turbo-heal for ${item.translationKey}`, e);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
