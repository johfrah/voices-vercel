import { db } from '@db';
import { translations, translationRegistry, appConfigs } from '@db/schema';
import { sql, desc, eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

/**
 *  API: VOICEGLOT LIST (GODMODE 2026)
 * 
 * Registry-Centric view: toont ELKE string uit de registry, 
 * ongeacht of er al vertalingen zijn.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    try {
      // CHRIS-PROTOCOL: Supabase SDK Direct Fetch (v2.14.393)
      // We bypass Drizzle/postgres-js entirely for this critical list to avoid production driver issues.
      console.log(`[Voiceglot List] SDK Fetch: Page ${page}, Limit ${limit}`);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Fetch Registry Items
      const { data: registryItems, error: regErr } = await supabase
        .from('translation_registry')
        .select('id, string_hash, original_text, context, last_seen')
        .order('last_seen', { ascending: false })
        .range(offset, offset + limit - 1);

      if (regErr) throw regErr;
      console.log(`[Voiceglot List] Registry Items found: ${registryItems?.length || 0}`);

      if (!registryItems || registryItems.length === 0) {
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Fetch translations for these keys
      const hashes = registryItems.map(i => i.string_hash);
      const { data: transData, error: transErr } = await supabase
        .from('translations')
        .select('id, translation_key, lang, translated_text, status, is_locked, is_manually_edited, updated_at')
        .in('translation_key', hashes);

      if (transErr) throw transErr;
      console.log(`[Voiceglot List] Translations found: ${transData?.length || 0}`);

      // 3. Join in memory
      const mappedResults = registryItems.map((item: any) => {
        const itemTranslations = (transData || []).filter((t: any) => t.translation_key === item.string_hash);
        
        // Detect source language
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
        hasMore: mappedResults.length === limit
      });
    } catch (dbErr: any) {
      console.error('❌ [Voiceglot List API] SDK Fetch failed:', dbErr);
      return NextResponse.json({ 
        error: `SDK Fetch failed: ${dbErr.message}`, 
        translations: [] 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
