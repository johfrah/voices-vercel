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
      // CHRIS-PROTOCOL: Pure Drizzle Two-Step Fetch (v2.14.385)
      // We use the ORM for maximum reliability and type-safety in production.
      
      // 1. Fetch Registry Items
      const registryItems = await db
        .select({
          id: translationRegistry.id,
          translationKey: translationRegistry.stringHash,
          originalText: translationRegistry.originalText,
          context: translationRegistry.context
        })
        .from(translationRegistry)
        .orderBy(desc(translationRegistry.lastSeen))
        .limit(limit)
        .offset(offset);

      console.log(`[Voiceglot List] Drizzle Registry Items: ${registryItems.length}`);

      if (!registryItems || registryItems.length === 0) {
        return NextResponse.json({ translations: [], page, limit, hasMore: false });
      }

      // 2. Fetch all translations for these keys
      const hashes = registryItems.map(i => i.translationKey);
      const transData = await db
        .select()
        .from(translations)
        .where(inArray(translations.translationKey, hashes));

      console.log(`[Voiceglot List] Drizzle Translations Data: ${transData.length}`);

      // 3. Join in memory
      const mappedResults = registryItems.map((item: any) => {
        const itemTranslations = transData
          .filter((t: any) => t.translationKey === item.translationKey)
          .map((t: any) => ({
            id: t.id,
            lang: t.lang,
            translatedText: t.translatedText,
            status: t.status,
            isLocked: t.isLocked || t.isManuallyEdited || false,
            updatedAt: t.updatedAt
          }));
        
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
      console.error('❌ [Voiceglot List API] Drizzle Fetch failed:', dbErr.message);
      return NextResponse.json({ error: dbErr.message, translations: [] }, { status: 500 });
    }
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
