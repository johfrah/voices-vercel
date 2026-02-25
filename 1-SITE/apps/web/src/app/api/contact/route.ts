import { DirectMailService } from '@/lib/services/direct-mail-service';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';
import { NextResponse } from 'next/server';

/**
 *  CONTACT API (Chatty mandate)
 * Accepts contact form submissions and forwards to the team via DirectMailService.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const to = market.email;

    const subjectLine = subject?.trim()
      ? `[Contact] ${String(subject).slice(0, 80)}`
      : `[Contact] Bericht van ${String(name).trim()}`;

    const { VoicesMailEngine } = await import('@/lib/services/voices-mail-engine');
    const mailEngine = VoicesMailEngine.getInstance();

    await mailEngine.sendVoicesMail({
      to,
      subject: subjectLine,
      title: 'Nieuw bericht via contactformulier',
      body: `
        <strong>Van:</strong> ${String(name).trim()}<br>
        <strong>E-mail:</strong> <a href="mailto:${String(email).trim()}">${String(email).trim()}</a><br>
        <strong>Onderwerp:</strong> ${subject?.trim() || '(niet opgegeven)'}<br><br>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; color: #333;">
          ${String(message).trim().replace(/</g, '&lt;').replace(/\n/g, '<br>')}
        </div>
      `,
      from: market.email,
      host: host
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Sending failed. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}
