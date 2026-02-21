import { OpenAIService } from '@/services/OpenAIService';
import { db } from '@db';
import { translations } from '@db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: SELF-HEALING & AUDIT TRANSLATIONS (GOD MODE 2026)
 * 
 * Doel: 
 * 1. Automatisch ontbrekende vertalingen registreren en vertalen.
 * 2. Bestaande vertalingen AUDITEN op native kwaliteit (GPT-4o).
 * 3. CONTEXT-AWARE: Gebruikt meegegeven context voor betere hertalingen.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    if (!bodyText) return NextResponse.json({ error: 'Empty request body' }, { status: 400 });

    let body;
    try { body = JSON.parse(bodyText); } catch (e) { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const { key, originalText, currentLang = 'nl', forceAudit = false, context = '', maxChars, values } = body;

    if (!key || !originalText) {
      return NextResponse.json({ error: 'Key and originalText required' }, { status: 400 });
    }

    // 1. Check of de key al bestaat voor deze taal
    const [existing] = await db
      .select()
      .from(translations)
      .where(and(eq(translations.translationKey, key), eq(translations.lang, currentLang)))
      .limit(1);

    // Als het geen forceAudit is en de vertaling bestaat al, zijn we klaar
    if (existing && existing.translatedText && !forceAudit) {
      return NextResponse.json({ success: true, message: 'Already exists', text: existing.translatedText });
    }

    //  CHRIS-PROTOCOL: Skip healing/audit if translation is locked
    if (existing?.isLocked) {
      console.log(` [VOICEGLOT] Skipping locked key [${key}]`);
      return NextResponse.json({ success: true, message: 'Locked', text: existing.translatedText });
    }

    console.log(` [VOICEGLOT] ${forceAudit ? 'AUDITING' : 'HEALING'} key [${key}] for lang [${currentLang}] with context [${context}]`);

    // 2. Live AI Vertaling / Audit via OpenAI GPT-4o
    let cleanTranslation = '';
    try {
      const valueContext = values ? `\nBESCHIKBARE WAARDEN VOOR PLACEHOLDERS: ${JSON.stringify(values)}` : '';
      
      const prompt = forceAudit 
        ? `
          Je bent een native speaker ${currentLang} en een expert in copywriting voor high-end merken.
          Audit de volgende vertaling van het Nederlands naar het ${currentLang}.
          
          CONTEXT: Voices.be is een premium voice-over agency. De toon is warm, professioneel, en direct (geen marketing-yoga).
          SPECIFIEKE CONTEXT: ${context || 'Algemene website tekst'}${valueContext}
          
          BELANGRIJK: 
          - Gebruik ALTIJD de beleefdheidsvorm (votre/vous in het Frans, Sie in het Duits).
          - Let op "valse vrienden" (zoals 'chaud' voor een stem, wat in het Frans 'geil' kan betekenen. Gebruik liever 'grave' of 'chaleureux').
          - De tekst moet natuurlijk en high-end aanvoelen voor een native speaker.
          
          TEMPLATE PLACEHOLDERS:
          - Behoud placeholders zoals {name}, {price}, {count}, {id}, {email} exact.
          - Vertaal de tekst eromheen en zet de placeholder op de grammaticaal juiste plek.
          - Vertaal NOOIT het woord binnen de accolades.
          
          ${maxChars ? `- STRIKTE LIMIET: Maximaal ${maxChars} tekens (inclusief spaties). Gebruik kortere synoniemen indien nodig.` : ''}
          
          Bron (NL): "${originalText}"
          Huidige vertaling: "${existing?.translatedText || ''}"
          
          Is de huidige vertaling perfect native en correct binnen de context? Zo nee, geef de verbeterde versie.
          Geef UITSLUITEND de verbeterde tekst terug, geen uitleg.
          Verbeterde tekst:
        `
        : `
          Vertaal de volgende tekst van het Nederlands naar het ${currentLang}.
          Houd je strikt aan de Voices Tone of Voice: warm, gelijkwaardig, vakmanschap.
          SPECIFIEKE CONTEXT: ${context || 'Algemene website tekst'}${valueContext}
          
          BELANGRIJK:
          - Gebruik ALTIJD de beleefdheidsvorm (votre/vous in het Frans, Sie in het Duits).
          - Let op context-specifieke nuances (bijv. stemkenmerken).
          - Geen AI-bingo woorden, geen em-dashes, max 15 words.
          
          TEMPLATE PLACEHOLDERS:
          - Behoud placeholders zoals {name}, {price}, {count}, {id}, {email} exact.
          - Vertaal de tekst eromheen en zet de placeholder op de grammaticaal juiste plek.
          - Vertaal NOOIT het woord binnen de accolades.
          
          ${maxChars ? `- STRIKTE LIMIET: Maximaal ${maxChars} tekens (inclusief spaties).` : ''}
          
          Tekst: "${originalText}"
          Vertaling:
        `;

      cleanTranslation = await OpenAIService.generateText(prompt, forceAudit ? "gpt-4o" : "gpt-4o-mini", currentLang);
      cleanTranslation = cleanTranslation.trim().replace(/^"|"$/g, '');

      //  CHRIS-FILTER: Auto-clean common AI slop
      const slopPrefixes = [
        'Vertaling:', 'Translation:', 'Traduction:', 'Traducción:', 'Traduzione:',
        'Verbeterde tekst:', 'Improved text:', 'Texte amélioré:',
        'Hier is de vertaling:', 'Here is the translation:', 'Voici la traduction:',
        'Native version:', 'Native translation:', 'Native audit:'
      ];

      for (const prefix of slopPrefixes) {
        if (cleanTranslation.startsWith(prefix)) {
          cleanTranslation = cleanTranslation.slice(prefix.length).trim();
        }
      }

      // Final trim and quote removal (sometimes AI adds nested quotes)
      cleanTranslation = cleanTranslation.replace(/^["']|["']$/g, '').trim();

      // Slop Filter
      if (cleanTranslation.length > 500 || cleanTranslation.includes('Het lijkt erop dat')) {
        throw new Error('AI returned slop');
      }
    } catch (aiErr: any) {
      console.error(' OpenAI Error:', aiErr.message);
      return NextResponse.json({ success: false, message: 'AI engine error', text: originalText }, { status: 500 });
    }

    // 3. Opslaan in de database
    if (cleanTranslation && cleanTranslation !== existing?.translatedText) {
      await db.insert(translations).values({
        translationKey: key,
        lang: currentLang,
        originalText: originalText,
        translatedText: cleanTranslation,
        context: context,
        status: 'active',
        isManuallyEdited: false,
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: [translations.translationKey, translations.lang],
        set: {
          translatedText: cleanTranslation,
          context: context,
          updatedAt: new Date()
        }
      });
      console.log(` [VOICEGLOT] Updated [${key}] -> [${cleanTranslation}]`);
    }

    return NextResponse.json({ 
      success: true, 
      text: cleanTranslation,
      _action: forceAudit ? 'audited' : 'healed' 
    });

  } catch (error) {
    console.error('[API Translation Heal Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
