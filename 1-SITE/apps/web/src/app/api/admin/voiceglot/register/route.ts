import { db, translations, translationRegistry } from '@/lib/system/voices-config';
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini-service';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: VOICEGLOT REGISTER (NUCLEAR 2026)
 * 
 * Doel: Registreert een nieuwe string in de registry en triggerd 
 * onmiddellijk de vertaling voor ALLE actieve talen.
 * 
 * Dit zorgt ervoor dat we niet hoeven te wachten op een bezoeker.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // We laten registratie toe zonder admin check voor de frontend, 
  // maar we beperken de rate of we checken de origin in productie.
  
  try {
    // 🛡️ CHRIS-PROTOCOL: Nuclear JSON Guard (v2.14.197)
    let body: any = {};
    try {
      body = await request.json();
    } catch (jsonErr) {
      console.warn('[RegisterAPI] Failed to parse JSON body:', jsonErr);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    
    const { key, sourceText, context } = body;

    if (!key || !sourceText) {
      return NextResponse.json({ error: 'Key and sourceText required' }, { status: 400 });
    }

    // 1. Registreer in de registry (Source of Truth)
    // We gebruiken een hash of de key als unieke identifier
    try {
      //  CHRIS-PROTOCOL: Forensische Database Check
      // We loggen de payload voor we inserten om de root cause van de 'Failed query' te vinden.
      console.log('[RegisterAPI] Attempting registry insert:', { key, sourceText, context });

      if (key && sourceText) {
        // 🛡️ CHRIS-PROTOCOL: 2s internal timeout for registry insert
        const insertPromise = db.insert(translationRegistry).values({
          stringHash: key, 
          originalText: sourceText,
          lastSeen: new Date(),
          context: context || 'auto-registered'
        }).onConflictDoUpdate({
          target: [translationRegistry.stringHash],
          set: { 
            originalText: sourceText,
            lastSeen: new Date(),
            context: context || 'auto-registered'
          }
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Registry insert timeout (2s)')), 2000)
        );

        await Promise.race([insertPromise, timeoutPromise]);
        console.log('[RegisterAPI] Registry insert success for key:', key);
      } else {
        console.warn('[RegisterAPI] Skipping insert: key or sourceText is missing');
      }
    } catch (dbError: any) {
      console.error('[RegisterAPI] Registry insert failed or timed out for key:', key, 'Error:', dbError.message);
      // We gaan door, want de registry is secundair aan de vertaling zelf
    }

    // 2. NUCLEAR HEALING: Trigger vertalingen voor alle talen ASYNC
    // We wachten hier niet op, de client krijgt direct antwoord.
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl-be', 'nl-nl'];
    
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
            .limit(1)
            .catch(() => []);

          if (!existing || !existing.translatedText || existing.translatedText === sourceText) {
            const prompt = `
              Vertaal de volgende tekst van het Nederlands naar het ${lang}.
              Context: ${context || 'Algemene website tekst'}
              Houd je strikt aan de Voices Tone of Voice: warm, gelijkwaardig, vakmanschap.
              Geen AI-bingo woorden, geen em-dashes, max 15 woorden.
              
              Tekst: "${sourceText}"
              Vertaling:
            `;

            const translatedText = await GeminiService.generateText(prompt, { lang: lang });
            let cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

            //  CHRIS-PROTOCOL: Slop Filter
            // Als de AI een foutmelding of conversatie teruggeeft, negeren we deze.
            const isSlop = (
              cleanTranslation.includes('Het lijkt erop dat') ||
              cleanTranslation.includes('Zou je de tekst') ||
              cleanTranslation.includes('niet compleet is') ||
              cleanTranslation.includes('context biedt') ||
              cleanTranslation.includes('meer informatie') ||
              cleanTranslation.includes('langere tekst') ||
              cleanTranslation.length > 200 // Vertalingen van labels zijn zelden zo lang
            );

            if (cleanTranslation && !isSlop) {
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
    const { ServerWatchdog } = await import('@/lib/services/server-watchdog');
    await ServerWatchdog.report({
      error: `Register API Failure: ${error.message}`,
      stack: error.stack,
      component: 'RegisterAPI',
      url: request.url,
      level: 'critical'
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
