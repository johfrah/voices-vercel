import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

//  CHRIS-PROTOCOL: SDK fallback for stability (v2.14.273)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

/**
 *  API: TRANSLATIONS (2026)
 * 
 * Doel: Haalt vertalingen direct uit de Supabase TranslationRegistry.
 * Vervangt de WordPress /wp-json/voices/v2/translations endpoint.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, translations: {} });
  }

  const { searchParams } = new URL(request.url);
  // 🛡️ CHRIS-PROTOCOL: Handshake ID Truth (v2.26.2)
  // We map the incoming lang code to the official ISO codes used in the DB.
  let targetLang = lang || 'nl-be';
  if (targetLang === 'en') targetLang = 'en-gb';
  if (targetLang === 'fr') targetLang = 'fr-be';
  if (targetLang === 'de') targetLang = 'de-de';
  if (targetLang === 'es') targetLang = 'es-es';
  if (targetLang === 'pt') targetLang = 'pt-pt';
  if (targetLang === 'it') targetLang = 'it-it';
  if (targetLang === 'nl') targetLang = 'nl-be';

  try {
    // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
    const { data: results, error } = await supabase
      .from('translations')
      .select('translation_key, translated_text, original_text, is_manually_edited, lang_id')
      .eq('lang', targetLang);

    if (error) throw error;

    const translationMap: Record<string, string> = {};
    results?.forEach(row => {
      const key = row.translation_key || row.translationKey;
      let text = row.translated_text || row.translatedText || row.original_text || row.originalText || '';
      
      // 🛡️ CHRIS-PROTOCOL: Force Original Text for Dutch (v2.19.4)
      // nl-be (ID 1) is ALWAYS pure. 
      // nl-nl (ID 2) only allows manual overrides.
      const langId = row.lang_id || row.langId;
      
      if (langId === 1 && row.original_text) {
        text = row.original_text;
      } else if (langId === 2 && row.original_text && !row.is_manually_edited) {
        text = row.original_text;
      }
      
      // 🛡️ CHRIS-PROTOCOL: Filter out 'NULL' strings from database (v2.14.780)
      if (key && text && text.toUpperCase() !== 'NULL') {
        translationMap[key] = text;
      }
    });

    //  CHRIS-PROTOCOL: Forceer de status 200 en de correcte headers voor de lancering
    const response = NextResponse.json({
      success: true,
      lang,
      translations: translationMap,
      _nuclear: true,
      _source: 'supabase-sdk'
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
