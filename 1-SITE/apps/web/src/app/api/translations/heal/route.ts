import { OpenAIService } from '@/lib/services/openai-service';
import { MarketManagerServer } from '@/lib/system/market-manager-server';
import { MarketDatabaseService } from '@/lib/system/market-manager-db';
import { db } from '@db';
import { translations } from '@db/schema';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { SlopFilter } from '@/lib/engines/slop-filter';

/**
 *  API: SELF-HEALING TRANSLATIONS (GOD MODE 2026)
 * 
 * Doel: Automatisch ontbrekende vertalingen registreren, vertalen via AI,
 * en de admin notificeren.
 * 
 *  UPDATE: Switched to OpenAI (GPT-4o mini) for higher rate limits and stability.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping heal during build' });
  }

  try {
    //  ANNA-PROTOCOL: Safe body parsing to prevent "Unexpected end of JSON input"
    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { key, originalText, currentLang = 'nl' } = body;

    if (!key || !originalText) {
      return NextResponse.json({ error: 'Key and originalText required' }, { status: 400 });
    }

    //  NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = await MarketDatabaseService.getCurrentMarketAsync(host);
    const adminEmail = process.env.ADMIN_EMAIL || market?.email || 'johfrah@voices.be';

    // 1. Check of de key al bestaat voor deze taal
    const [existing] = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.translationKey, key),
          eq(translations.lang, currentLang)
        )
      )
      .limit(1)
      .catch((err) => {
        console.error(`[heal] DB Select Error for ${key}:`, err);
        return [];
      });

    if (existing && existing.translatedText && existing.translatedText !== 'Initial Load') {
      return NextResponse.json({ success: true, message: 'Already exists', text: existing.translatedText });
    }

    console.log(` SELF-HEALING (OpenAI): New key detected [${key}] for lang [${currentLang}]`);

    // 2. Live AI Vertaling via OpenAI
    let cleanTranslation = '';
    try {
      //  CHRIS-PROTOCOL: Context-Aware Prompting
      // We gebruiken de key om de AI te vertellen waar de tekst voor dient.
      let contextHint = "Dit is een algemene tekst op de website.";
      if (key.startsWith('home.')) contextHint = "Dit is een tekst voor de homepage.";
      else if (key.startsWith('seo.')) contextHint = "Dit is een SEO titel of beschrijving.";
      else if (key.startsWith('cta.')) contextHint = "Dit is een Call to Action knop of tekst.";
      else if (key.startsWith('common.')) contextHint = "Dit is een veelvoorkomend UI label.";
      else if (key.startsWith('calculator.')) contextHint = "Dit is tekst voor de prijscalculator.";
      else if (key.startsWith('checkout.')) contextHint = "Dit is tekst voor het afrekenproces.";
      else if (key.startsWith('actor.')) contextHint = "Dit is informatie over een stemacteur.";

      const prompt = `
        Je bent de senior vertaler voor een high-end castingbureau voor stemmen.
        Vertaal de volgende tekst van het Nederlands naar het ${currentLang}.
        
        Context: ${contextHint}
        Tone of Voice: warm, gelijkwaardig, vakmanschap, nuchter.
        
        Regels:
        - Geen AI-bingo woorden (zoals 'ontdek', 'passie', 'ervaar').
        - Geen em-dashes.
        - Behoud placeholders zoals {price}, {words}, {name} exact zoals ze zijn.
        - Maximaal 15 woorden.
        
        Tekst: "${originalText}"
        Vertaling:
      `;

      cleanTranslation = await OpenAIService.generateText(prompt);
      cleanTranslation = cleanTranslation.trim().replace(/^"|"$/g, '');

      //  CHRIS-PROTOCOL: Slop Filter
      if (SlopFilter.isSlop(cleanTranslation, currentLang, originalText)) {
        throw new Error('AI returned slop instead of translation');
      }
    } catch (aiErr: any) {
      console.error(' OpenAI Self-Heal Error:', aiErr.message);
      return NextResponse.json({ 
        success: false, 
        message: 'AI engine error',
        text: originalText 
      }, { status: 500 });
    }

    // 3. Opslaan in de database (DIRECT LIVE - User Mandate)
    if (cleanTranslation) {
      await db.insert(translations).values({
        translationKey: key,
        lang: currentLang,
        originalText: originalText,
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
      }).catch((err) => {
        console.error(`[heal] DB Insert/Update Error for ${key}:`, err);
      });
    }

    // 4. Notificatie naar Admin (Post-Action Info)
    // CHRIS-PROTOCOL: Disabled per User Request - No more self-healing emails.
    /*
    try {
      //  CHRIS-PROTOCOL: Skip notification for initial load key to prevent spam
      if (key !== 'initial_load') {
        const { DirectMailService } = await import('@/lib/services/direct-mail-service');
        const mailService = DirectMailService.getInstance();
        await mailService.sendMail({
          to: adminEmail,
          subject: ` Voicy Self-Heal LIVE: Nieuwe vertaling [${key}]`,
          html: `
            <div style="font-family: sans-serif; padding: 40px; background: #f9f9f9; border-radius: 24px;">
              <h2 style="letter-spacing: -0.02em; color: #ff4f00;"> Self-Healing Live</h2>
              <p>Er is een ontbrekende vertaling live gefixed op de frontend.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Key:</strong> <code>${key}</code></p>
              <p><strong>Taal:</strong> ${currentLang.toUpperCase()}</p>
              <p><strong>Bron (NL):</strong> ${originalText}</p>
              <p style="color: #ff4f00; font-size: 18px;"><strong>AI Vertaling:</strong> ${cleanTranslation}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <div style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/voiceglot" style="background: #ff4f00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">BEVESTIG OF PAS AAN</a>
              </div>
              <p style="font-size: 10px; color: #999; margin-top: 40px;">Gegenereerd door de Voices Engine - Pure Excellence 2026</p>
            </div>
          `
        });
      }
    } catch (mailErr) {
      console.error(' Failed to send self-heal notification:', mailErr);
    }
    */

    return NextResponse.json({ 
      success: true, 
      text: cleanTranslation,
      _healed: true 
    });

  } catch (error) {
    console.error('[API Translation Heal Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
