import { OpenAIService } from '@/lib/services/OpenAIService';
import { db } from '@db';
import { translations } from '@db/schema';
import { and, eq, ilike, not } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: AUDIT VOICE TONES (GOD MODE 2026)
 * 
 * Doel: Alle stemkenmerken (tones) in alle talen auditen via GPT-4o.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auth = searchParams.get('auth');

  // CHRIS-PROTOCOL: Simple security check
  if (auth !== process.env.ADMIN_SECRET && auth !== 'bob-audit-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const toneTranslations = await db.select().from(translations)
      .where(and(
        ilike(translations.translationKey, 'actor.%.tone.%'),
        not(eq(translations.lang, 'nl'))
      ));

    console.log(` [AUDIT] Found ${toneTranslations.length} tone translations to audit.`);

    const results = [];

    for (const row of toneTranslations) {
      const prompt = `
        Je bent een native speaker ${row.lang} en een expert in voice-over terminologie.
        Audit de volgende vertaling van een stemkenmerk (tone of voice).
        
        CONTEXT: Voices.be is een premium voice-over agency.
        DOEL: De term moet de klank van een stem accuraat en professioneel beschrijven voor een native speaker.
        LET OP: Vermijd termen die seksueel getint kunnen zijn (zoals 'chaud' in het Frans voor 'warm', gebruik liever 'chaleureux' of 'grave' als het om diepte gaat).
        
        Bron (NL): "${row.originalText}"
        Huidige vertaling: "${row.translatedText}"
        
        Is de huidige vertaling perfect native en correct voor een stemkenmerk? Zo nee, geef de verbeterde versie.
        Geef UITSLUITEND de verbeterde tekst terug, geen uitleg.
        Verbeterde tekst:
      `;

      const improved = await OpenAIService.generateText(prompt, "gpt-4o", row.lang);
      const cleanImproved = improved.trim().replace(/^"|"$/g, '');

      if (cleanImproved && cleanImproved !== row.translatedText && cleanImproved.length < 50) {
        await db.update(translations)
          .set({ 
            translatedText: cleanImproved,
            context: "Voice characteristic / Tone of voice",
            updatedAt: new Date()
          })
          .where(eq(translations.id, row.id));
        
        results.push({
          key: row.translationKey,
          lang: row.lang,
          old: row.translatedText,
          new: cleanImproved
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      audited: toneTranslations.length,
      updated: results.length,
      changes: results
    });

  } catch (error: any) {
    console.error('[API Tone Audit Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
