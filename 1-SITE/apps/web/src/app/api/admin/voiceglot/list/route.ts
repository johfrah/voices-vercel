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
      // CHRIS-PROTOCOL: Nuclear Raw SQL with Literal Parameters (v2.14.389)
      // We bypass parameter binding for LIMIT/OFFSET which fails in production.
      
      console.log(`[Voiceglot List] Fetching Registry: Page ${page}, Limit ${limit} (Nuclear Mode)`);

      // 1. Fetch Registry Items using Raw SQL with literal numbers
      const registryItems = await db.execute(sql`
        SELECT id, string_hash as "translationKey", original_text as "originalText", context
        FROM translation_registry
        ORDER BY last_seen DESC
        LIMIT ${sql.raw(limit.toString())}
        OFFSET ${sql.raw(offset.toString())}
      `);

      console.log(`[Voiceglot List] Registry Items found: ${registryItems.length}`);

      if (!registryItems || registryItems.length === 0) {
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Fetch all translations for these keys
      const hashes = registryItems.map((i: any) => i.translationKey);
      
      // Use a simpler query for translations
      const transData = await db.execute(sql`
        SELECT id, translation_key as "translationKey", lang, translated_text as "translatedText", status, 
               (is_locked OR is_manually_edited) as "isLocked", updated_at as "updatedAt"
        FROM translations
        WHERE translation_key = ANY(${hashes})
      `);

      console.log(`[Voiceglot List] Translations Data found: ${transData.length}`);

      // 3. Join in memory
      const mappedResults = registryItems.map((item: any) => {
        const itemTranslations = transData.filter((t: any) => t.translationKey === item.translationKey);
        
        // Detect source language (Simple heuristic)
        const text = (item.originalText || '').toLowerCase();
        const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ');
        const isEn = text.includes(' the ') || text.includes(' and ');
        const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ');
        
        let detectedLang = 'nl';
        if (isFr && !isNl) detectedLang = 'fr';
        else if (isEn && !isNl) detectedLang = 'en';

        return {
          ...item,
          sourceLang: detectedLang,
          translations: itemTranslations
        };
      });

      return NextResponse.json({ 
        translations: mappedResults,
        page,
        limit,
        hasMore: mappedResults.length === limit
      });
    } catch (dbErr: any) {
      console.error('❌ [Voiceglot List API] Nuclear Fetch failed:', dbErr.message);
      // Fallback: return empty but with error info for debugging
      return NextResponse.json({ error: `Nuclear Fetch failed: ${dbErr.message}`, translations: [] }, { status: 500 });
    }
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
