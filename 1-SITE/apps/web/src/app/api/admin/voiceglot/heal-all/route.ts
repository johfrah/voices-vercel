import { db } from '@db';
import { translations, translationRegistry } from '@db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/services/openai-service';
import { GeminiService } from '@/lib/services/gemini-service';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { requireAdmin } from '@/lib/auth/api-auth';
import { SlopFilter } from '@/lib/engines/slop-filter';

/**
 *  API: VOICEGLOT HEAL-ALL (NUCLEAR 2026)
 * 
 * Doel: Scant de hele registry op ontbrekende vertalingen en vult deze aan
 * met maximale intelligentie (Market DNA + Context Aware).
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

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    // 1. Haal alle unieke strings uit de registry
    const registryItems = await db.select().from(translationRegistry).catch(() => []);

    // 2. Cache Market DNA per taal voor snelheid
    const dnaCache: Record<string, string> = {};
    for (const lang of targetLanguages) {
      dnaCache[lang] = await GeminiService.getInstance().getMarketDNA(lang);
    }

    //  CHRIS-PROTOCOL: Resume-First Batching
    // We filteren eerst de items die ECHT healing nodig hebben
    const itemsToHeal = [];
    for (const item of registryItems) {
      for (const lang of targetLanguages) {
        const [existing] = await db
          .select()
          .from(translations)
          .where(
            and(
              eq(translations.translationKey, item.stringHash),
              eq(translations.lang, lang)
            )
          )
          .limit(1)
          .catch(() => []);

        if (!existing || !existing.translatedText || existing.translatedText === 'Initial Load' || existing.status === 'healing_failed') {
          itemsToHeal.push({ item, lang });
        }
      }
    }

    console.log(`🚀 Starting Healing for ${itemsToHeal.length} items...`);

    for (const { item, lang } of itemsToHeal) {
      try {
        // Markeer als 'healing' in de DB zodat de UI dit live kan tonen
        await db.insert(translations).values({
          translationKey: item.stringHash,
          lang: lang,
          originalText: item.originalText,
          translatedText: '...',
          status: 'healing',
          updatedAt: new Date()
        }).onConflictDoUpdate({
          target: [translations.translationKey, translations.lang],
          set: { status: 'healing', updatedAt: new Date() }
        });

        // 3. Vertaal via OpenAI (GPT-4o mini) met volledige context
        const dna = dnaCache[lang] || '';
          
          //  CHRIS-PROTOCOL: Intelligent Context Enhancement
          //  CHRIS-PROTOCOL: Intelligent Context Enhancement
          let contextHint = item.context || 'Algemene website tekst';
          if (item.stringHash.startsWith('cta.') || item.stringHash.includes('.btn') || item.stringHash.includes('.button')) {
            contextHint = `Dit is een interactieve knop (CTA). Houd de vertaling kort, krachtig en actiegericht. Context: ${contextHint}`;
          } else if (item.stringHash.startsWith('seo.')) {
            contextHint = `Dit is SEO metadata. Gebruik relevante zoekwoorden voor de ${lang} markt. Context: ${contextHint}`;
          } else if (item.stringHash.startsWith('calculator.')) {
            contextHint = `Dit is tekst voor de prijscalculator. Wees precies met getallen en eenheden. Context: ${contextHint}`;
          } else if (item.stringHash.startsWith('checkout.')) {
            contextHint = `Dit is tekst voor het afrekenproces. Vertrouwen en duidelijkheid zijn hier cruciaal. Context: ${contextHint}`;
          } else if (item.stringHash.startsWith('media.') && (item.stringHash.endsWith('.alt_text') || item.stringHash.endsWith('.file_name'))) {
            contextHint = `Dit is een bestandsnaam of alt-tekst voor media. Vertaal NOOIT merknamen of technische bestandsnamen (zoals 'Bigger', 'Voices', etc). Als de tekst een eigennaam lijkt, laat deze dan ongewijzigd. Context: ${contextHint}`;
          } else if (item.originalText.length < 20) {
            contextHint = `Dit is een kort UI label of menu-item. Context: ${contextHint}`;
          }

          const prompt = `
            Je bent de senior vertaler voor Voices.be, een high-end castingbureau voor stemmen.
            Vertaal de volgende tekst van het Nederlands naar het ${lang}.
            
            MARKET DNA & RULES:
            ${dna}
            
            CONTEXT:
            ${contextHint}
            
            TONE OF VOICE:
            Warm, gelijkwaardig, vakmanschap, nuchter. Geen AI-bingo woorden (zoals 'ontdek', 'passie', 'ervaar').
            
            STRICT OUTPUT RULES:
            - Antwoord UITSLUITEND met de vertaalde tekst.
            - Vertaal NOOIT merknamen (Voices, Studio, Academy, Artist) of technische bestandsnamen.
            - Geen inleiding zoals "De vertaling is:".
            - Geen herhaling van de brontekst.
            - Geen aanhalingstekens rond de vertaling.
            - Behoud de betekenis en de Voices-vibe.
            
            TEKST:
            "${item.originalText}"
            
            VERTALING:
          `;

          const translatedText = await OpenAIService.generateText(prompt);
          const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

          // 4. Slop Filter (Chris-Protocol)
          if (SlopFilter.isSlop(cleanTranslation, lang, item.originalText)) {
            console.warn(`[Heal-All] Slop detected for ${item.stringHash} (${lang}), skipping.`);
            continue;
          }

          // 5. Opslaan in de database
          await db.insert(translations).values({
            translationKey: item.stringHash,
            lang: lang,
            originalText: item.originalText,
            translatedText: cleanTranslation,
            status: 'active',
            isManuallyEdited: false,
            updatedAt: new Date()
          }).onConflictDoUpdate({
            target: [translations.translationKey, translations.lang],
            set: {
              translatedText: cleanTranslation,
              status: 'active',
              updatedAt: new Date()
            }
          });

          totalHealed++;
      } catch (err) {
        console.error(`❌ Healing failed for ${item.stringHash} (${lang}):`, err);
        await db.update(translations)
          .set({ status: 'healing_failed', updatedAt: new Date() })
          .where(and(eq(translations.translationKey, item.stringHash), eq(translations.lang, lang)));
      }
    }

    // 4. Notificatie naar Admin na voltooiing
    if (totalHealed > 0) {
      try {
        const { DirectMailService } = await import('@/lib/services/direct-mail-service');
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
