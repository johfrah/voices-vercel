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
  let lang = searchParams.get('lang') || 'nl-be';

  // 💀 TERMINATION: 'nl' variant is eliminated. Force 'nl-be'.
  if (lang === 'nl') lang = 'nl-be';

  try {
    // 🛡️ CHRIS-PROTOCOL: Use SDK for stability (v2.14.273)
    const { data: results, error } = await supabase
      .from('translations')
      .select('translation_key, translated_text, original_text')
      .eq('lang', lang);

    if (error) throw error;

    const translationMap: Record<string, string> = {};
    results?.forEach(row => {
      const key = row.translation_key || row.translationKey;
      const text = row.translated_text || row.translatedText || row.original_text || row.originalText || '';
      
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
