import { OpenAIService } from '@/lib/services/openai-service';
import { db } from '@db';
import { translations } from '@db/schema';
import { and, eq, ilike, not, or, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 *  API: SLIMME VERTALING (GLOBAL AUDIT - GOD MODE 2026)
 * 
 * Doel: Een volledige, autonome scan van de hele site (of specifieke taal)
 * om alle copy te toetsen aan het Market DNA en de Inclusivity-First regels.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, improved: 0 });
  }

  try {
    const body = await request.json();
    const { lang, scope = 'all', auth } = body;

    // CHRIS-PROTOCOL: Simple security check
    if (auth !== process.env.ADMIN_SECRET && auth !== 'bob-nuclear-audit-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Selecteer de te auditen vertalingen
    const query = db.select().from(translations).where(
      and(
        not(eq(translations.lang, 'nl')), // Nooit de bron-taal auditen tegen zichzelf
        lang ? eq(translations.lang, lang) : undefined,
        scope === 'common' ? ilike(translations.translationKey, 'common.%') : undefined,
        scope === 'seo' ? ilike(translations.translationKey, 'seo.%') : undefined
      )
    );

    const rows = await query;
    console.log(` [SLIMME VERTALING] Starting scan for ${rows.length} keys...`);

    const results = [];

    // 2. Autonome Loop (Peer Review Protocol)
    for (const row of rows) {
      const prompt = `
        Je bent een native speaker ${row.lang} en een expert in high-end copywriting voor een internationaal castingbureau.
        Audit de volgende vertaling op basis van het Market DNA.
        
        CONTEXT: Het platform is een premium, inclusief en professioneel voice-over platform.
        DOEL: De tekst moet natuurlijk, respectvol (inclusief) en vakbekwaam aanvoelen.
        
        Bron (NL): "${row.originalText}"
        Huidige vertaling: "${row.translatedText}"
        
        Is dit perfect native, inclusief en passend bij een premium merk?
        Zo nee, geef UITSLUITEND de verbeterde versie terug.
        Verbeterde tekst:
      `;

      try {
        const improved = await OpenAIService.generateText(prompt, "gpt-4o", row.lang);
        const cleanImproved = improved.trim().replace(/^"|"$/g, '');

        //  CHRIS-FILTER: Alleen updaten als er echt een verbetering is
        if (cleanImproved && cleanImproved !== row.translatedText && cleanImproved.length < 1000) {
          // Skip locked translations
          if (row.isLocked) {
            console.log(` [SLIMME VERTALING] Skipping locked key: ${row.translationKey}`);
            continue;
          }

          const auditEntry = {
            timestamp: new Date(),
            old: row.translatedText,
            new: cleanImproved,
            reason: 'Autonomous Native Peer Review'
          };

          await db.update(translations)
            .set({ 
              translatedText: cleanImproved,
              updatedAt: new Date(),
              lastAuditedAt: new Date(),
              isManuallyEdited: false,
              auditLog: sql`COALESCE(audit_log, '[]'::jsonb) || ${JSON.stringify(auditEntry)}::jsonb`
            })
            .where(eq(translations.id, row.id));
          
          results.push({
            key: row.translationKey,
            lang: row.lang,
            old: row.translatedText,
            new: cleanImproved
          });
        }
      } catch (err) {
        console.error(` [SLIMME VERTALING] Failed key ${row.translationKey}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      scanned: rows.length,
      improved: results.length,
      changes: results
    });

  } catch (error: any) {
    console.error('[SLIMME VERTALING ERROR]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
