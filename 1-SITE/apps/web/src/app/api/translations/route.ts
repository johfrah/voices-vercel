import { db } from '@db';
import { translations } from '@db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: TRANSLATIONS (2026)
 * 
 * Doel: Haalt vertalingen direct uit de Supabase TranslationRegistry.
 * Vervangt de WordPress /wp-json/voices/v2/translations endpoint.
 */

export const dynamic = 'force-dynamic';
// export const runtime = 'edge'; // Drizzle with postgres-js requires Node.js runtime

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'nl';

  try {
    const results = await db
      .select()
      .from(translations)
      .where(eq(translations.lang, lang));

    const translationMap: Record<string, string> = {};
    results.forEach(row => {
      if (row.translationKey) {
        translationMap[row.translationKey] = row.translatedText || row.originalText || '';
      }
    });

    //  SELF-HEALING: Als er geen vertalingen zijn voor deze taal, trigger een 'Heal' event
    if (results.length === 0 && lang !== 'nl') {
      console.log(` [HEAL] Triggering translation generation for: ${lang}`);
      // We doen dit async zodat de gebruiker niet hoeft te wachten
      // In een server context gebruiken we de interne URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voices.be';
      fetch(`${baseUrl}/api/translations/heal?bob=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLang: lang, key: 'initial_load', originalText: 'Welkom bij Voices' })
      }).catch(err => console.error('Failed to trigger translation healing:', err));
    }

    //  CHRIS-PROTOCOL: Forceer de status 200 en de correcte headers voor de lancering
    const response = NextResponse.json({
      success: true,
      lang,
      translations: translationMap,
      _nuclear: true,
      _source: 'supabase'
    });

    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    console.error('[API Translations Error]:', error);
    //  STABILITEIT: Geef nooit een 500, maar een lege map zodat de site blijft draaien
    return NextResponse.json({ 
      success: false, 
      lang, 
      translations: {},
      error: 'Database connection issue, falling back to default text'
    });
  }
}
