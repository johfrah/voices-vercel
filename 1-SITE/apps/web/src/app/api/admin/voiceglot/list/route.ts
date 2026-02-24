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
      // CHRIS-PROTOCOL: Use Atomic Raw SQL Join for absolute reliability
      // We use explicit parameter binding ($1, $2) to prevent driver issues with large offsets.
      const results = await db.execute(sql`
        SELECT 
          r.id,
          r.string_hash as "translationKey",
          r.original_text as "originalText",
          r.context,
          (
            SELECT json_agg(t_inner)
            FROM (
              SELECT 
                t.id, 
                t.lang, 
                t.translated_text as "translatedText", 
                t.status, 
                (t.is_locked OR t.is_manually_edited) as "isLocked",
                t.updated_at as "updatedAt"
              FROM translations t
              WHERE t.translation_key = r.string_hash
            ) t_inner
          ) as translations
        FROM translation_registry r
        ORDER BY r.last_seen DESC
        LIMIT ${sql` ${limit} `}
        OFFSET ${sql` ${offset} `}
      `);

      const mappedResults = (results as any).map((item: any) => {
        // Detect source language
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
          translations: item.translations || []
        };
      });

      return NextResponse.json({ 
        translations: mappedResults,
        page,
        limit,
        hasMore: mappedResults.length === limit
      });
    } catch (dbErr: any) {
      console.error('❌ [Voiceglot List API] Atomic SQL failed:', dbErr.message);
      return NextResponse.json({ error: dbErr.message, translations: [] }, { status: 500 });
    }
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
