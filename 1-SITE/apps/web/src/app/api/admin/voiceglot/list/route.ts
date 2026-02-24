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
      // CHRIS-PROTOCOL: Ultra-Stable Single Fetch (v2.14.391)
      // We test if a basic fetch works at all.
      console.log(`[Voiceglot List] Ultra-Stable Fetch: Page ${page}, Limit ${limit}`);

      // 1. Fetch Registry Items using the most basic Drizzle pattern
      // We use a simpler select to avoid any potential schema issues
      const registryItems = await db
        .select({
          id: translationRegistry.id,
          stringHash: translationRegistry.stringHash,
          originalText: translationRegistry.originalText,
          context: translationRegistry.context,
          lastSeen: translationRegistry.lastSeen
        })
        .from(translationRegistry)
        .orderBy(desc(translationRegistry.lastSeen))
        .limit(limit)
        .offset(offset);

      console.log(`[Voiceglot List] Registry Items found: ${registryItems?.length || 0}`);

      if (!registryItems || registryItems.length === 0) {
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Fetch translations for these keys
      const hashes = registryItems.map(i => i.stringHash);
      const transData = await db
        .select({
          id: translations.id,
          translationKey: translations.translationKey,
          lang: translations.lang,
          translatedText: translations.translatedText,
          status: translations.status,
          isLocked: translations.isLocked,
          isManuallyEdited: translations.isManuallyEdited,
          updatedAt: translations.updatedAt
        })
        .from(translations)
        .where(inArray(translations.translationKey, hashes));

      console.log(`[Voiceglot List] Translations found: ${transData?.length || 0}`);

      // 3. Join in memory
      const mappedResults = registryItems.map((item: any) => {
        const itemTranslations = transData.filter((t: any) => t.translationKey === item.stringHash);
        
        // Detect source language
        const text = (item.originalText || '').toLowerCase();
        const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ');
        const isEn = text.includes(' the ') || text.includes(' and ');
        const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ');
        
        let detectedLang = 'nl';
        if (isFr && !isNl) detectedLang = 'fr';
        else if (isEn && !isNl) detectedLang = 'en';

        return {
          id: item.id,
          translationKey: item.stringHash,
          originalText: item.originalText,
          context: item.context,
          sourceLang: detectedLang,
          translations: itemTranslations.map((t: any) => ({
            id: t.id,
            lang: t.lang,
            translatedText: t.translatedText,
            status: t.status,
            isLocked: t.isLocked || t.isManuallyEdited || false,
            updatedAt: t.updatedAt
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
      console.error('❌ [Voiceglot List API] Ultra-Stable Fetch failed:', dbErr);
      return NextResponse.json({ 
        error: `Ultra-Stable Fetch failed: ${dbErr.message}`, 
        translations: [] 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
