import { db } from '@db';
import { translations } from '@db/schema';
import { desc } from 'drizzle-orm';
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
      //  CHRIS-PROTOCOL: Pagination/Limit for stability (Godmode 2026)
      // De tabel is gegroeid naar 7000+ rijen, we tonen de laatste 500 voor performance.
      results = await db.select().from(translations).orderBy(desc(translations.updatedAt)).limit(500);
    } catch (dbErr) {
      console.warn(' [Voiceglot List API] Drizzle failed, falling back to SDK');
      const { data } = await supabase.from('translations').select('*').order('updated_at', { ascending: false }).limit(500);
      results = (data || []).map(r => ({
        ...r,
        translationKey: r.translation_key,
        originalText: r.original_text,
        translatedText: r.translated_text,
        isLocked: r.is_locked,
        isManuallyEdited: r.is_manually_edited,
        updatedAt: r.updated_at,
        lastAuditedAt: r.last_audited_at
      }));
    }

    return NextResponse.json({ translations: results });
  } catch (error: any) {
    console.error(' [Voiceglot List API] Fatal Error:', error);
    return NextResponse.json({ error: error.message, translations: [] }, { status: 500 });
  }
}
