import { db, translations, translationRegistry } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { GeminiService } from '@/lib/services/gemini-service';
import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

/**
 *  API: TURBO HEAL (GOD MODE 2026)
 * 
 * Doel: Forceer AI vertalingen voor alle ontbrekende keys in alle talen.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping turbo-heal during build' });
  }

  const targetLanguages = ['fr', 'en', 'de', 'es', 'pt'];
  const results: any = {};

  try {
    // CHRIS-PROTOCOL: Use SDK fallback for stability
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let allStrings: any[] = [];
    try {
      allStrings = await db.select().from(translationRegistry);
    } catch (dbErr) {
      console.warn(' [TurboHeal API] Drizzle failed to fetch registry, falling back to SDK');
      const { data, error } = await supabase.from('translation_registry').select('*');
      if (error) throw error;
      allStrings = (data || []).map(s => ({
        id: s.id,
        stringHash: s.string_hash,
        originalText: s.original_text,
        context: s.context,
        lastSeen: s.last_seen
      }));
    }
    
    for (const lang of targetLanguages) {
      let existingKeys = new Set<string>();
      try {
        const existing = await db.select({ key: translations.translationKey }).from(translations).where(eq(translations.lang, lang));
        existingKeys = new Set(existing.map(trans => trans.key));
      } catch (dbErr) {
        console.warn(` [TurboHeal API] Drizzle failed to fetch existing translations for ${lang}, falling back to SDK`);
        const { data } = await supabase.from('translations').select('translation_key').eq('lang', lang);
        existingKeys = new Set((data || []).map(trans => trans.translation_key));
      }

      const missing = allStrings.filter(s => !existingKeys.has(s.stringHash));
      
      results[lang] = { total: allStrings.length, missing: missing.length, healed: 0 };

      // We healen er max 50 per keer om timeouts te voorkomen
      for (const item of missing.slice(0, 50)) {
        try {
          //  CHRIS-PROTOCOL: Data Integrity
          const key = item.stringHash;
          const text = item.originalText;
          const context = item.context || 'Algemene website tekst';

          if (!key || !text) continue;

          const prompt = `
            Vertaal naar het ${lang}: "${text}". 
            Context: ${context}
            Voices Tone: warm, vakmanschap, gelijkwaardig. 
            Geen AI-bingo, geen em-dashes.
            Max 15 woorden.
          `;
          const translated = await GeminiService.generateText(prompt, { lang: lang });
          const clean = translated.trim().replace(/^"|"$/g, '');

          try {
            await db.insert(translations).values({
              translationKey: key,
              lang: lang,
              originalText: text,
              translatedText: clean,
              status: 'active',
              updatedAt: new Date()
            });
          } catch (dbInsertErr) {
            console.warn(` [TurboHeal API] Drizzle failed to insert translation for ${lang}, falling back to SDK`);
            await supabase.from('translations').insert({
              translation_key: key,
              lang: lang,
              original_text: text,
              translated_text: clean,
              status: 'active',
              updated_at: new Date()
            });
          }
          results[lang].healed++;
        } catch (e) {
          console.error(`Failed turbo-heal for item:`, item, e);
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
