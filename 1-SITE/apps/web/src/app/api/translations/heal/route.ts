import { NextRequest, NextResponse } from 'next/server';
import { db } from '@db';
import { translations } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { GeminiService } from '@/services/GeminiService';
import { DirectMailService } from '@/services/DirectMailService';
import { MarketManager } from '@config/market-manager';

/**
 * 🩹 API: SELF-HEALING TRANSLATIONS (GOD MODE 2026)
 * 
 * Doel: Automatisch ontbrekende vertalingen registreren, vertalen via AI,
 * en de admin notificeren.
 */

export async function POST(request: NextRequest) {
  try {
    const { key, originalText, currentLang } = await request.json();

    if (!key || !originalText) {
      return NextResponse.json({ error: 'Key and originalText required' }, { status: 400 });
    }

    // 🌍 NUCLEAR CONFIG: Haal admin e-mail uit MarketManager of ENV
    const host = request.headers.get('host') || 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

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
      .limit(1);

    if (existing && existing.translatedText) {
      return NextResponse.json({ success: true, message: 'Already exists', text: existing.translatedText });
    }

    console.log(`🩹 SELF-HEALING: New key detected [${key}] for lang [${currentLang}]`);

    // 2. Live AI Vertaling via Voicy (Gemini)
    const prompt = `
      Vertaal de volgende tekst van het Nederlands naar het ${currentLang}.
      Houd je strikt aan de Voices Tone of Voice: warm, gelijkwaardig, vakmanschap.
      Geen AI-bingo woorden, geen em-dashes, max 15 woorden.
      
      Tekst: "${originalText}"
      Vertaling:
    `;

    const translatedText = await GeminiService.generateText(prompt);
    const cleanTranslation = translatedText.trim().replace(/^"|"$/g, '');

    // 3. Opslaan in de database (DIRECT LIVE - User Mandate)
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
    });

    // 4. Notificatie naar Admin (Post-Action Info)
    try {
      const { DirectMailService } = await import('@/services/DirectMailService');
      const mailService = DirectMailService.getInstance();
      await mailService.sendMail({
        to: adminEmail,
        subject: `🩹 Voicy Self-Heal LIVE: Nieuwe vertaling [${key}]`,
        html: `
          <div style="font-family: sans-serif; padding: 40px; background: #f9f9f9; border-radius: 24px;">
            <h2 style="text-transform: uppercase; letter-spacing: -0.02em; color: #ff4f00;">🩹 Self-Healing Live</h2>
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
            <p style="font-size: 10px; color: #999; margin-top: 40px;">Gegenereerd door de Voices Engine - Pure God Mode 2026</p>
          </div>
        `
      });
    } catch (mailErr) {
      console.error('❌ Failed to send self-heal notification:', mailErr);
    }

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
