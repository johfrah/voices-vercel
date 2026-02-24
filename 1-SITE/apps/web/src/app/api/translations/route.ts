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
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, translations: {} });
  }

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
    //  DISABLED: Voorkomt onnodige healing triggers bij het openen van de site.
    //  CHRIS-PROTOCOL: We triggeren NOOIT healing voor de basistalen (nl-BE, nl-NL) omdat dit de bron-talen zijn.
    /*
    if (results.length === 0 && !lang.startsWith('nl')) {
      console.log(` [HEAL] Triggering translation generation for: ${lang}`);
      // ...
    }
    */

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
