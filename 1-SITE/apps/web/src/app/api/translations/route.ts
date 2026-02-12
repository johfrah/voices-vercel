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

    return NextResponse.json({
      success: true,
      lang,
      translations: translationMap,
      _nuclear: true,
      _source: 'supabase'
    });
  } catch (error) {
    console.error('[API Translations Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
