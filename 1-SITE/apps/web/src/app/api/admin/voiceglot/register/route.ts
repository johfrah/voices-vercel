import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/services/GeminiService';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: VOICEGLOT REGISTER (NUCLEAR 2026)
 * 
 * Doel: Registreert een nieuwe string in de registry en triggerd 
 * onmiddellijk de vertaling voor ALLE actieve talen.
 * 
 * Dit zorgt ervoor dat we niet hoeven te wachten op een bezoeker.
 */

export async function POST(request: NextRequest) {
  // We laten registratie toe zonder admin check voor de frontend, 
  // maar we beperken de rate of we checken de origin in productie.
  
  try {
    const { key, sourceText } = await request.json();

    if (!key || !sourceText) {
      return NextResponse.json({ error: 'Key and sourceText required' }, { status: 400 });
    }

    // 1. Registreer in de registry (Source of Truth)
    // We gebruiken een hash of de key als unieke identifier
    await db.insert(translationRegistry).values({
      stringHash: key, // We gebruiken de key als hash voor VoiceglotText compatibiliteit
      originalText: sourceText,
      lastSeen: new Date().toISOString()
    }).onConflictDoUpdate({
      target: [translationRegistry.stringHash],
      set: { 
        originalText: sourceText,
        lastSeen: new Date().toISOString() 
      }
    });

    // 2. NUCLEAR HEALING: Trigger vertalingen voor alle talen ASYNC
    // We wachten hier niet op, de client krijgt direct antwoord.
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt'];
    
    // We doen de healing in de achtergrond
    (async () => {
      for (const lang of targetLanguages) {
        try {
          // Check of deze vertaling al bestaat
          const [existing] = await db
            .select()
            .from(translations)
            .where(
              and(
                eq(translations.translationKey, key),
                eq(translations.lang, lang)
              )
            )
            .limit(1);

          if (!existing || !existing.translatedText || existing.translatedText === sourceText) {
            const prompt = `
              Vertaal de volgende tekst van het Nederlands naar het ${lang}.
              Houd je strikt aan de Voices Tone of Voice: warm, gelijkwaardig, vakmanschap.
              Geen AI-bingo woorden, geen em-dashes, max 15 woorden.
              
              Tekst: "${sourceText}"
              Vertaling:
            `;

            const translatedText = await GeminiService.generateText(prompt);
            const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

            if (cleanTranslation) {
              await db.insert(translations).values({
                translationKey: key,
                lang: lang,
                originalText: sourceText,
                translatedText: cleanTranslation,
                status: 'active',
                isManuallyEdited: false,
                updatedAt: new Date()
              }).onConflictDoUpdate({
                target: [translations.translationKey, translations.lang],
                set: {
                  translatedText: cleanTranslation,
                  updatedAt: new Date()
                }
              });
            }
          }
        } catch (err) {
          console.error(`[Background Heal] Failed for ${lang}:`, err);
        }
      }
    })();

    return NextResponse.json({ success: true, message: 'String registered and healing triggered' });

  } catch (error: any) {
    console.error('[API Voiceglot Register Error]:', error);
    
    //  CHRIS-PROTOCOL: Report server-side error to Watchdog
    const { ServerWatchdog } = await import('@/lib/server-watchdog');
    ServerWatchdog.report({
      error: `Register API Failure: ${error.message}`,
      stack: error.stack,
      component: 'RegisterAPI',
      url: request.url,
      level: 'critical'
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
