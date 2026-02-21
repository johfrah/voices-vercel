import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { eq } from 'drizzle-orm';
import { GeminiService } from '@/services/GeminiService';
import { NextResponse } from 'next/server';

/**
 *  API: TURBO HEAL (GOD MODE 2026)
 * 
 * Doel: Forceer AI vertalingen voor alle ontbrekende keys in alle talen.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  // We voeren geen turbo-heal uit tijdens de build fase om timeouts en DB-errors te voorkomen.
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return NextResponse.json({ success: true, message: 'Skipping turbo-heal during build' });
  }

  const targetLanguages = ['fr', 'en', 'de', 'es', 'pt'];
  const results: any = {};

  try {
    const allStrings = await db.select().from(translationRegistry);
    
    for (const lang of targetLanguages) {
      const existing = await db.select({ key: translations.translationKey }).from(translations).where(eq(translations.lang, lang));
      const existingKeys = new Set(existing.map(t => t.key));
      const missing = allStrings.filter(s => !existingKeys.has(s.stringHash));
      
      results[lang] = { total: allStrings.length, missing: missing.length, healed: 0 };

      // We healen er max 15 per keer om timeouts te voorkomen
      for (const item of missing.slice(0, 15)) {
        try {
          //  CHRIS-PROTOCOL: Data Integrity
          // We checken of de key en tekst wel bestaan voor we de AI aanroepen.
          const key = item.stringHash || (item as any).translationKey;
          const text = item.originalText || (item as any).defaultText;

          if (!key || !text) {
            console.warn(`[TurboHeal] Missing key or text for item:`, item);
            continue;
          }

          const prompt = `Vertaal naar het ${lang}: "${text}". Voices Tone: warm, vakmanschap. Max 15 woorden.`;
          const translated = await GeminiService.generateText(prompt, { lang: lang });
          const clean = translated.trim().replace(/^"|"$/g, '');

          await db.insert(translations).values({
            translationKey: key,
            lang: lang,
            originalText: text,
            translatedText: clean,
            status: 'active',
            updatedAt: new Date()
          });
          results[lang].healed++;
        } catch (e) {
          console.error(`Failed turbo-heal for item:`, item, e);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
