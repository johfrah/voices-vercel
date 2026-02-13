import { MarketManager } from '@config/market-manager';
import { DirectMailService } from '@/services/DirectMailService';
import { NextResponse } from 'next/server';

/**
 * 📬 CONTACT API (Chatty mandate)
 * Accepts contact form submissions and forwards to the team via DirectMailService.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Naam is verplicht.' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'E-mail is verplicht.' },
        { status: 400 }
      );
    }

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Bericht is verplicht.' },
        { status: 400 }
      );
    }

    const host = request.headers.get('host') || 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    const to = market.email;

    const subjectLine = subject?.trim()
      ? `[Contact] ${String(subject).slice(0, 80)}`
      : `[Contact] Bericht van ${String(name).trim()}`;

    const textBody = [
      `Bericht ontvangen via het contactformulier op voices.be`,
      ``,
      `Van: ${String(name).trim()}`,
      `E-mail: ${String(email).trim()}`,
      `Onderwerp: ${subject?.trim() || '(niet opgegeven)'}`,
      ``,
      `--- Bericht ---`,
      String(message).trim()
    ].join('\n');

    const htmlBody = `
      <p style="font-family:sans-serif;font-size:15px;color:#333;">
        Bericht ontvangen via het contactformulier.
      </p>
      <p style="font-family:sans-serif;font-size:15px;color:#666;">
        <strong>Van:</strong> ${String(name).trim()}<br>
        <strong>E-mail:</strong> <a href="mailto:${String(email).trim()}">${String(email).trim()}</a><br>
        <strong>Onderwerp:</strong> ${subject?.trim() || '(niet opgegeven)'}
      </p>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">
      <p style="font-family:sans-serif;font-size:15px;color:#333;white-space:pre-wrap;">${String(message).trim().replace(/</g, '&lt;')}</p>
    `.trim();

    const mailService = DirectMailService.getInstance();
    await mailService.sendMail({
      to,
      subject: subjectLine,
      text: textBody,
      html: htmlBody,
      from: market.email,
      replyTo: String(email).trim()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'De verzending is mislukt. Controleer je verbinding en probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
