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

    // CHRIS-PROTOCOL: SDK fallback for stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let results: any[] = [];
    try {
      // 1. Haal items uit de registry
      const registryItems = await db
        .select({
          stringHash: translationRegistry.stringHash,
          originalText: translationRegistry.originalText,
          context: translationRegistry.context,
          lastSeen: translationRegistry.lastSeen
        })
        .from(translationRegistry)
        .orderBy(desc(translationRegistry.lastSeen))
        .limit(limit)
        .offset(offset);

      if (registryItems.length === 0) {
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Haal bijbehorende vertalingen op
      const hashes = registryItems.map(i => i.stringHash);
      const batchTranslations = await db
        .select()
        .from(translations)
        .where(inArray(translations.translationKey, hashes))
        .catch(() => []);

      results = registryItems.map(item => {
        const itemTranslations = batchTranslations.filter((t: any) => t.translationKey === item.stringHash || t.translation_key === item.stringHash);
        
        // Detect source language
        const text = (item.originalText || '').toLowerCase();
        const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ');
        const isEn = text.includes(' the ') || text.includes(' and ');
        const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ');
        
        let detectedLang = 'nl';
        if (isFr && !isNl) detectedLang = 'fr';
        else if (isEn && !isNl) detectedLang = 'en';

        return {
          translationKey: item.stringHash,
          originalText: item.originalText,
          context: item.context,
          sourceLang: detectedLang,
          translations: itemTranslations.map((t: any) => ({
            id: t.id,
            lang: t.lang,
            translatedText: t.translatedText || t.translated_text,
            status: t.status,
            isLocked: t.isManuallyEdited || t.is_manually_edited,
            updatedAt: t.updatedAt || t.updated_at
          }))
        };
      });
    } catch (dbErr: any) {
      console.warn('⚠️ [Voiceglot List API] Drizzle failed, falling back to SDK:', dbErr.message);
      const { data: registryData } = await supabase
        .from('translation_registry')
        .select('*')
        .order('last_seen', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!registryData) return NextResponse.json({ translations: [], page, limit, hasMore: false });

      const hashes = registryData.map(i => i.string_hash);
      const { data: transData } = await supabase
        .from('translations')
        .select('*')
        .in('translation_key', hashes);

      results = registryData.map((item: any) => {
        const itemTranslations = (transData || []).filter((t: any) => t.translation_key === item.string_hash);
        return {
          translationKey: item.string_hash,
          originalText: item.original_text,
          context: item.context,
          sourceLang: 'nl',
          translations: itemTranslations.map((t: any) => ({
            id: t.id,
            lang: t.lang,
            translatedText: t.translated_text,
            status: t.status,
            isLocked: t.is_manually_edited,
            updatedAt: t.updated_at
          }))
        };
      });
    }

    return NextResponse.json({ 
      translations: results,
      page,
      limit,
      hasMore: results.length === limit
    });
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
