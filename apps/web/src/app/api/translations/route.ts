import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getLocaleFallbacks, normalizeLocale } from '@/lib/system/locale-utils';

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
  const requestedLang = searchParams.get('lang') || request.headers.get('x-voices-lang') || 'nl-be';
  const targetLang = normalizeLocale(requestedLang);

  try {
    const localeCandidates = getLocaleFallbacks(targetLang);
    let effectiveLang = targetLang;
    let results: Array<{
      translation_key: string;
      translated_text: string | null;
      original_text: string | null;
      is_manually_edited: boolean | null;
      lang_id: number | null;
    }> = [];

    for (const candidate of localeCandidates) {
      const { data, error } = await supabase
        .from('translations')
        .select('translation_key, translated_text, original_text, is_manually_edited, lang_id')
        .eq('lang', candidate);
      if (error) throw error;
      if ((data?.length || 0) > 0) {
        effectiveLang = candidate;
        results = data || [];
        break;
      }
    }

    const translationMap: Record<string, string> = {};
    results?.forEach(row => {
      const key = row.translation_key;
      let text = row.translated_text || row.original_text || '';
      
      // 🛡️ CHRIS-PROTOCOL: Force Original Text for Dutch (v2.19.4)
      // nl-be (ID 1) is ALWAYS pure. 
      // nl-nl (ID 2) only allows manual overrides.
      const langId = row.lang_id;
      
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
      lang: effectiveLang,
      requested_lang: targetLang,
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
      lang: targetLang, 
      translations: {},
      error: 'Database connection issue, falling back to default text'
    });
  }
}
