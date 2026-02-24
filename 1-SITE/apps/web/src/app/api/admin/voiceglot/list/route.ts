import { db } from '@db';
import { translations, translationRegistry, appConfigs } from '@db/schema';
import { sql, desc, eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

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

    let results: any[] = [];
    try {
      // 1. Haal items uit de registry via direct SQL (Bulletproof)
      console.log(`[Voiceglot List] Fetching page ${page} (limit ${limit}, offset ${offset})`);
      const registryData = await db.execute(sql`
        SELECT string_hash, original_text, context, last_seen
        FROM translation_registry
        ORDER BY last_seen DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      if (!registryData || (registryData as any).length === 0) {
        console.log('[Voiceglot List] No registry items found');
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Haal bijbehorende vertalingen op
      const hashes = (registryData as any).map((i: any) => i.string_hash);
      console.log(`[Voiceglot List] Fetching translations for ${hashes.length} hashes`);
      
      // CHRIS-PROTOCOL: Use ANY with explicit array casting for PostgreSQL compatibility
      const transData = await db.execute(sql`
        SELECT id, translation_key, lang, translated_text, status, is_manually_edited, updated_at
        FROM translations
        WHERE translation_key = ANY(${hashes}::text[])
      `);
      
      console.log(`[Voiceglot List] Found ${transData.length} translations`);

      results = (registryData as any).map((item: any) => {
        const itemTranslations = (transData as any || []).filter((t: any) => t.translation_key === item.string_hash);
        
        // Detect source language
        const text = (item.original_text || '').toLowerCase();
        const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ');
        const isEn = text.includes(' the ') || text.includes(' and ');
        const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ');
        
        let detectedLang = 'nl';
        if (isFr && !isNl) detectedLang = 'fr';
        else if (isEn && !isNl) detectedLang = 'en';

        return {
          translationKey: item.string_hash,
          originalText: item.original_text,
          context: item.context,
          sourceLang: detectedLang,
          translations: itemTranslations.map((t: any) => ({
            id: t.id,
            lang: t.lang,
            translatedText: t.translated_text || '',
            status: t.status,
            isLocked: t.is_manually_edited || false,
            updatedAt: t.updated_at
          }))
        };
      });
    } catch (dbErr: any) {
      console.error('❌ [Voiceglot List API] Raw SQL failed:', dbErr.message);
      return NextResponse.json({ error: dbErr.message, translations: [] }, { status: 500 });
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
