import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // CHRIS-PROTOCOL: SDK fallback for stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let results: any[] = [];
    try {
      //  CHRIS-PROTOCOL: Join with Registry for Context (Godmode 2026)
      // We halen de context (bijv. de naam van de acteur) direct op uit de registry.
      const rawResults = await db
        .select({
          id: translations.id,
          translationKey: translations.translationKey,
          lang: translations.lang,
          originalText: translations.originalText,
          translatedText: translations.translatedText,
          isLocked: translations.isManuallyEdited,
          isManuallyEdited: translations.isManuallyEdited,
          updatedAt: translations.updatedAt,
          lastAuditedAt: translations.updatedAt,
          context: translationRegistry.context
        })
        .from(translations)
        .leftJoin(translationRegistry, eq(translations.translationKey, translationRegistry.stringHash))
        .orderBy(desc(translations.updatedAt))
        .limit(500);
      
      results = rawResults;
    } catch (dbErr) {
      console.warn(' [Voiceglot List API] Drizzle failed, falling back to SDK');
      const { data } = await supabase.from('translations').select('*, translation_registry(context)').order('updated_at', { ascending: false }).limit(500);
      results = (data || []).map((r: any) => ({
        ...r,
        translationKey: r.translation_key,
        originalText: r.original_text,
        translatedText: r.translated_text,
        isLocked: r.is_manually_edited,
        isManuallyEdited: r.is_manually_edited,
        updatedAt: r.updated_at,
        context: r.translation_registry?.context
      }));
    }

    return NextResponse.json({ translations: results });
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
