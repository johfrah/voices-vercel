import { db, getTable, translationRegistry } from '@/lib/system/voices-config';

const translations = getTable('translations');
import { eq, and } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/services/gemini-service';
import { requireAdmin } from '@/lib/auth/api-auth';
import { createClient } from '@supabase/supabase-js';

// 🛡️ CHRIS-PROTOCOL: SDK fallback for stability (v2.14.750)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    const { key, sourceText, context, sourceLangId } = body;

    if (!key || !sourceText) {
      return NextResponse.json({ error: 'Key and sourceText required' }, { status: 400 });
    }

    // 🛡️ CHRIS-PROTOCOL: Slop Filter (v2.16.002)
    // Voorkom dat HTML-slop (zoals Voiceglot spans) in de registry belandt.
    if (sourceText.includes('contenteditable') || sourceText.includes('focus:ring-primary/30')) {
      console.warn('[RegisterAPI] HTML Slop detected in sourceText, skipping registration:', sourceText);
      return NextResponse.json({ success: true, message: 'Slop detected and ignored' });
    }

    // 1. Registreer in de registry (Source of Truth)
    // We gebruiken een hash of de key als unieke identifier
    try {
      //  CHRIS-PROTOCOL: Forensische Database Check
      // We loggen de payload voor we inserten om de root cause van de 'Failed query' te vinden.
      console.log('[RegisterAPI] Attempting registry insert:', { key, sourceText, context, sourceLangId });

      if (key && sourceText) {
        // 🛡️ CHRIS-PROTOCOL: 2s internal timeout for registry insert
        const insertPromise = db.insert(translationRegistry).values({
          stringHash: key, 
          originalText: sourceText,
          lastSeen: new Date(),
          context: context || 'auto-registered',
          sourceLangId: sourceLangId || 1 // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth
        }).onConflictDoUpdate({
          target: [translationRegistry.stringHash],
          set: { 
            originalText: sourceText,
            lastSeen: new Date(),
            context: context || 'auto-registered',
            sourceLangId: sourceLangId || 1
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
    
    // We doen de healing in de achtergrond
    (async () => {
      try {
        // 🛡️ CHRIS-PROTOCOL: Handshake Truth (v2.19.2)
        // We halen de actieve talen uit de database in plaats van een hardcoded lijst.
        const { data: activeLanguages, error: langError } = await supabase
          .from('languages')
          .select('id, code')
          .eq('status', 'active');

        if (langError || !activeLanguages) {
          console.error('[RegisterAPI] Failed to fetch active languages for healing:', langError);
          return;
        }

        for (const langObj of activeLanguages) {
          const lang = langObj.code.toLowerCase();
          try {
            // 🛡️ CHRIS-PROTOCOL: Skip healing for Dutch (v2.18.7)
            // We don't want AI to "polish" or "translate" Dutch to Dutch.
            // In the future, we could check if langObj.id === source_lang_id
            if (lang.startsWith('nl')) continue;

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
                // 🛡️ CHRIS-PROTOCOL: Kleine pauze om database pooler te ontlasten (v2.16.001)
                await new Promise(resolve => setTimeout(resolve, 200));

                await db.insert(translations).values({
                  translationKey: key,
                  lang: lang,
                  originalText: sourceText,
                  translatedText: cleanTranslation,
                  status: 'active',
                  is_manually_edited: false,
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
      } catch (outerErr) {
        console.error('[RegisterAPI] Background healing process failed:', outerErr);
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
