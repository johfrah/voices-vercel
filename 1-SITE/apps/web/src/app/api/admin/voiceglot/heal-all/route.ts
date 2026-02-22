import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/services/GeminiService';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { requireAdmin } from '@/lib/auth/api-auth';

/**
 *  API: VOICEGLOT HEAL-ALL (NUCLEAR 2026)
 * 
 * Doel: Scant de hele registry op ontbrekende vertalingen en vult deze aan
 * zonder dat er een pagina geopend hoeft te worden.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, healedCount: 0, message: 'Skipping heal-all during build' });
  }

  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const targetLanguages = ['en', 'fr', 'de', 'es', 'pt'];
    let totalHealed = 0;

    //  NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    // 1. Haal alle unieke strings uit de registry
    const registryItems = await db.select().from(translationRegistry).catch(() => []);

    for (const item of registryItems) {
      for (const lang of targetLanguages) {
        // Check of deze vertaling al bestaat
        const [existing] = await db
          .select()
          .from(translations)
          .where(
            and(
              eq(translations.translationKey, item.registryKey),
              eq(translations.lang, lang)
            )
          )
          .limit(1)
          .catch(() => []);

        if (!existing || !existing.translatedText) {
          // 2. Vertaal via AI
          const prompt = `
            Vertaal de volgende tekst van het Nederlands naar het ${lang}.
            Houd je strikt aan de Voices Tone of Voice: warm, gelijkwaardig, vakmanschap.
            Geen AI-bingo woorden, geen em-dashes, max 15 woorden.
            
            Tekst: "${item.sourceText}"
            Vertaling:
          `;

          const translatedText = await GeminiService.generateText(prompt, { lang: lang });
          const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

          // 3. Opslaan in de database (DIRECT LIVE - User Mandate)
          await db.insert(translations).values({
            translationKey: item.registryKey,
            lang: lang,
            originalText: item.sourceText,
            translatedText: cleanTranslation,
            status: 'active',
            isManuallyEdited: false,
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: [translations.translationKey, translations.lang],
            set: {
              translatedText: cleanTranslation,
              updatedAt: new Date()
            }
          });

          totalHealed++;
        }
      }
    }

    // 4. Notificatie naar Admin na voltooiing
    if (totalHealed > 0) {
      try {
        const { DirectMailService } = await import('@/services/DirectMailService');
        const mailService = DirectMailService.getInstance();
        await mailService.sendMail({
          to: adminEmail,
          subject: ` Nuclear Heal-All LIVE: ${totalHealed} vertalingen toegevoegd`,
          html: `
            <div style="font-family: sans-serif; padding: 40px; background: #000; color: #fff; border-radius: 24px;">
              <h2 style="letter-spacing: -0.02em; color: #ff4f00;"> Nuclear Heal-All Live</h2>
              <p>De Freedom Machine heeft een volledige scan uitgevoerd en alle vertalingen direct geactiveerd.</p>
              <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
              <p style="font-size: 24px; font-weight: bold;">${totalHealed} strings zijn nu live.</p>
              <p>Alle ontbrekende vertalingen voor EN, FR, DE, ES en PT zijn verwerkt.</p>
              <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;" />
              <div style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/voiceglot" style="background: #ff4f00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">BEKIJK STATISTIEKEN</a>
              </div>
              <p style="font-size: 10px; color: #666; margin-top: 40px;">Gegenereerd door de Voices Engine - Zero Touch Operations 2026</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error(' Failed to send completion notification:', mailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      healedCount: totalHealed,
      message: `Nuclear Healing voltooid voor ${totalHealed} strings.`
    });

  } catch (error) {
    console.error('[API Voiceglot Heal-All Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
