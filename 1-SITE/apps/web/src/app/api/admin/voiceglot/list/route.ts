import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

/**
 *  API: VOICEGLOT LIST (GODMODE 2026)
 * 
 * Registry-Centric view: toont ELKE string uit de registry, 
 * ongeacht of er al vertalingen zijn.
 * 
 * Nu met ondersteuning voor sorteren op laatst vertaald.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const sort = searchParams.get('sort') || 'last_seen'; // 'last_seen' of 'recent_translated'
    const offset = (page - 1) * limit;

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let registryItems: any[] = [];
      let hasMore = false;

      if (sort === 'recent_translated') {
        // CHRIS-PROTOCOL: Sort by most recently updated translations
        // 1. Haal de unieke keys op die het laatst zijn bijgewerkt in de translations tabel
        const { data: recentTrans, error: transErr } = await supabase
          .from('translations')
          .select('translation_key, updated_at')
          .order('updated_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (transErr) throw transErr;

        if (!recentTrans || recentTrans.length === 0) {
          return NextResponse.json({ translations: [], page, limit, hasMore: false });
        }

        // Unieke keys behouden (in volgorde van verschijning)
        const uniqueKeys = [...new Set(recentTrans.map(t => t.translation_key))];
        
        // 2. Haal de bijbehorende registry items op
        const { data: items, error: regErr } = await supabase
          .from('translation_registry')
          .select('*')
          .in('string_hash', uniqueKeys);

        if (regErr) throw regErr;

        // Sorteer de items terug in de volgorde van de recentTrans
        registryItems = uniqueKeys.map(key => items?.find(i => i.string_hash === key)).filter(Boolean);
        hasMore = recentTrans.length === limit;
      } else {
        // Standaard: Sorteer op last_seen in de registry
        const { data, error: regErr } = await supabase
          .from('translation_registry')
          .select('id, string_hash, original_text, context, last_seen')
          .order('last_seen', { ascending: false })
          .range(offset, offset + limit - 1);

        if (regErr) throw regErr;
        registryItems = data || [];
        hasMore = registryItems.length === limit;
      }

      if (registryItems.length === 0) {
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Fetch translations for these keys
      const hashes = registryItems.map(i => i.string_hash);
      const { data: transData, error: transErr } = await supabase
        .from('translations')
        .select('id, translation_key, lang, translated_text, status, is_locked, is_manually_edited, updated_at')
        .in('translation_key', hashes);

      if (transErr) throw transErr;

      // 3. Join in memory
      const mappedResults = registryItems.map((item: any) => {
        const itemTranslations = (transData || []).filter((t: any) => t.translation_key === item.string_hash);
        
        // Detect source language (eenvoudige heuristiek)
        const text = (item.original_text || '').toLowerCase();
        const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ');
        const isEn = text.includes(' the ') || text.includes(' and ');
        const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ');
        
        let detectedLang = 'nl';
        if (isFr && !isNl) detectedLang = 'fr';
        else if (isEn && !isNl) detectedLang = 'en';

        return {
          id: item.id,
          translationKey: item.string_hash,
          originalText: item.original_text,
          context: item.context,
          sourceLang: detectedLang,
          translations: itemTranslations.map((t: any) => ({
            id: t.id,
            lang: t.lang,
            translatedText: t.translated_text,
            status: t.status,
            isLocked: t.is_locked || t.is_manually_edited || false,
            updatedAt: t.updated_at
          }))
        };
      });

      return NextResponse.json({ 
        translations: mappedResults,
        page,
        limit,
        hasMore
      });
    } catch (dbErr: any) {
      console.error('❌ [Voiceglot List API] SDK Fetch failed:', dbErr);
      return NextResponse.json({ error: dbErr.message, translations: [] }, { status: 500 });
    }
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
