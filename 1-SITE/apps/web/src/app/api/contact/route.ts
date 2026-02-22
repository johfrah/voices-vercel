import { DirectMailService } from '@/services/DirectMailService';
import { MarketManager } from '@config/market-manager';
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

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const to = market.email;

    const subjectLine = subject?.trim()
      ? `[Contact] ${String(subject).slice(0, 80)}`
      : `[Contact] Bericht van ${String(name).trim()}`;

    const textBody = [
      `Message received via contact form on voices.be`,
      ``,
      `From: ${String(name).trim()}`,
      `E-mail: ${String(email).trim()}`,
      `Subject: ${subject?.trim() || '(not specified)'}`,
      ``,
      `--- Message ---`,
      String(message).trim()
    ].join('\n');

    const htmlBody = `
      <p style="font-family:sans-serif;font-size:15px;color:#333;">
        Message received via contact form.
      </p>
      <p style="font-family:sans-serif;font-size:15px;color:#666;">
        <strong>From:</strong> ${String(name).trim()}<br>
        <strong>E-mail:</strong> <a href="mailto:${String(email).trim()}">${String(email).trim()}</a><br>
        <strong>Subject:</strong> ${subject?.trim() || '(not specified)'}
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
      { error: 'Sending failed. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}
