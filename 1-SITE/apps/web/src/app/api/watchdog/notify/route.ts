import { NextResponse } from 'next/server';

/**
 *  WATCHDOG NOTIFIER (NUCLEAR 2026)
 * 
 * Doel: Johfrah direct informeren bij kritieke app-fouten.
 * Verstuurt technische details naar de admin.
 */

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { message, cause, url, digest } = body;
    const recipient = process.env.ADMIN_EMAIL;
    if (!recipient) {
      console.warn('[Watchdog Notify] No ADMIN_EMAIL configured');
      return NextResponse.json({ success: true });
    }
    
    console.error(` [WATCHDOG] Error detected at ${url}: ${message}`);

    // 1. Prepare Email Content
    const emailBody = `
       VOICES WATCHDOG ALERT (2026)
      
      Er is een kritieke fout opgetreden op de live site.
      
       URL: ${url}
       FOUT: ${message}
       OORZAAK: ${cause || 'Onbekend'}
       DIGEST: ${digest || 'Geen digest'}
      
      Tijdstip: ${new Date().toLocaleString('nl-BE')}
      Status: Voices Engine probeert te herstellen...
    `;

    // 2. Call Internal Email Service (Bypass auth for system alerts)
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'https://voices-vercel.vercel.app';
    
    // We loggen het voor nu ook naar de server console
    console.log(' Sending Watchdog Alert to:', recipient);

    try {
      // We gebruiken de interne mailbox route met de SYSTEM_SECRET
      const response = await fetch(`${emailServiceUrl}/api/mailbox/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-system-secret': process.env.SYSTEM_SECRET || ''
        },
        body: JSON.stringify({
          to: recipient,
          subject: ` VOICES ALERT: ${message.substring(0, 50)}`,
          body: emailBody
        }),
      });

      if (!response.ok) {
        console.error(' Watchdog: Email service failed to respond correctly');
      }
    } catch (emailError) {
      console.error(' Watchdog: Could not reach email service:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(' Watchdog Notify API Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
