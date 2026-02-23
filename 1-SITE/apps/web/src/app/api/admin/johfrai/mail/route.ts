import { NextRequest, NextResponse } from 'next/server';
import { voices-mail-engine } from '@/lib/services/voices-mail-engine';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

/**
 * 🎙️ JOHFRAI MAIL API (2026)
 * 
 * Verstuurt gegenereerde audiofragmenten van de Mac Mini naar de gebruiker.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const text = formData.get('text') as string;
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = market.email;
    const email = formData.get('email') as string || adminEmail;
    
    if (!email) return NextResponse.json({ error: 'No recipient email' }, { status: 400 });

    if (!audioFile) {
      return NextResponse.json({ success: false, error: 'Geen audiobestand ontvangen' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const mailEngine = voices-mail-engine.getInstance();

    await mailEngine.sendVoicesMail({
      to: email,
      subject: `🎙️ Johfrai Fragment: ${text.substring(0, 30)}...`,
      title: 'Je Johfrai Fragment is klaar.',
      body: `
        Hier is het audiofragment dat zojuist is gegenereerd op je Mac Mini.<br/><br/>
        <div style="background: #fcfaf7; padding: 20px; border-radius: 15px; border: 1px solid #eee; margin: 20px 0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #ccc; margin-bottom: 8px;">Ingevoerde tekst</div>
          <div style="font-size: 15px; color: #1a1a1a; font-style: italic;">"${text}"</div>
        </div>
        Gegenereerd door de Private Voice Engine (Mac Mini Edition).
      `,
      host: host
      // TODO: Add attachment support to sendVoicesMail
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [Johfrai Mail] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
