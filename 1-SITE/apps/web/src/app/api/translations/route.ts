import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { translations } from '@db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * ⚡ API: TRANSLATIONS (2026)
 * 
 * Doel: Haalt vertalingen direct uit de Supabase TranslationRegistry.
 * Vervangt de WordPress /wp-json/voices/v2/translations endpoint.
 */

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

    // 🏥 SELF-HEALING: Als er geen vertalingen zijn voor deze taal, trigger een 'Heal' event
    if (results.length === 0 && lang !== 'nl') {
      console.log(`🏥 [HEAL] Triggering translation generation for: ${lang}`);
      // We doen dit async zodat de gebruiker niet hoeft te wachten
      // In een server context gebruiken we de interne URL
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/translations/heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, reason: 'missing_translations' })
      }).catch(err => console.error('Failed to trigger translation healing:', err));
    }

    return NextResponse.json({
      success: true,
      lang,
      translations: translationMap,
      _nuclear: true,
      _source: 'supabase'
    });
  } catch (error) {
    console.error('[API Translations Error]:', error);
    // 🛡️ STABILITEIT: Geef nooit een 500, maar een lege map zodat de site blijft draaien
    return NextResponse.json({ 
      success: false, 
      lang, 
      translations: {},
      error: 'Database connection issue, falling back to default text'
    });
  }
}
