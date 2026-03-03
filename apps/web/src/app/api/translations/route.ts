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
    let localeLocked = false;
    const mergedRows = new Map<string, {
      translation_key: string;
      translated_text: string | null;
      original_text: string | null;
      is_manually_edited: boolean | null;
      lang_id: number | null;
      status?: string | null;
      updated_at?: string | null;
    }>();

    const getRowScore = (row: {
      translated_text: string | null;
      is_manually_edited: boolean | null;
      status?: string | null;
      updated_at?: string | null;
    }): number => {
      const hasTranslated = !!row.translated_text && row.translated_text !== '...';
      const statusScore = row.status === 'active' ? 30 : 0;
      const manualScore = row.is_manually_edited ? 40 : 0;
      const translatedScore = hasTranslated ? 20 : 0;
      const freshnessScore = row.updated_at ? new Date(row.updated_at).getTime() / 1e15 : 0;
      return statusScore + manualScore + translatedScore + freshnessScore;
    };

    const fetchAllRowsForLocale = async (candidate: string) => {
      const pageSize = 500;
      let offset = 0;
      const allRows: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('translations')
          .select('translation_key, translated_text, original_text, is_manually_edited, lang_id, status, updated_at')
          .eq('lang', candidate)
          .range(offset, offset + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allRows.push(...data);
        if (data.length < pageSize) break;
        offset += pageSize;
      }

      return allRows;
    };

    for (const candidate of localeCandidates) {
      const data = await fetchAllRowsForLocale(candidate);
      if ((data?.length || 0) > 0 && !localeLocked) {
        effectiveLang = candidate;
        localeLocked = true;
      }
      const bestRowsForCandidate = new Map<string, any>();
      for (const row of (data || [])) {
        if (!row.translation_key) continue;
        const existing = bestRowsForCandidate.get(row.translation_key);
        if (!existing || getRowScore(row) > getRowScore(existing)) {
          bestRowsForCandidate.set(row.translation_key, row);
        }
      }
      for (const [key, row] of bestRowsForCandidate.entries()) {
        // Candidate order determines priority across locales: first locale with key wins.
        if (!mergedRows.has(key)) {
          mergedRows.set(key, row);
        }
      }
    }

    const results = Array.from(mergedRows.values());
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
