import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

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
      //  CHRIS-PROTOCOL: Registry-Centric Query (Godmode 2026)
      // We gaan uit van de registry zodat we ELKE string zien, ook zonder vertalingen.
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

      // Haal alle vertalingen op voor deze batch hashes
      const hashes = registryItems.map(i => i.stringHash);
      const batchTranslations = hashes.length > 0 ? await db
        .select()
        .from(translations)
        .where(sql`${translations.translationKey} IN ${hashes}`)
        .catch(() => []) : [];

      results = registryItems.map(item => {
        const itemTranslations = batchTranslations.filter((t: any) => t.translationKey === item.stringHash);
        
        // Detect source language (fallback logic)
        const text = (item.originalText || '').toLowerCase();
        const isFr = text.includes(' le ') || text.includes(' la ') || text.includes(' les ') || text.includes(' être ');
        const isEn = text.includes(' the ') || text.includes(' and ') || text.includes(' with ');
        const isNl = text.includes(' de ') || text.includes(' het ') || text.includes(' en ') || text.includes(' is ');
        
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
            translatedText: t.translatedText,
            status: t.status,
            isLocked: t.isManuallyEdited,
            updatedAt: t.updatedAt
          }))
        };
      });
    } catch (dbErr) {
      console.warn(' [Voiceglot List API] Drizzle failed, falling back to SDK');
      const { data } = await supabase
        .from('translations')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      results = (data || []).map((r: any) => ({
        ...r,
        translationKey: r.translation_key,
        originalText: r.original_text,
        translatedText: r.translated_text,
        isLocked: r.is_manually_edited,
        isManuallyEdited: r.is_manually_edited,
        updatedAt: r.updated_at
      }));
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
