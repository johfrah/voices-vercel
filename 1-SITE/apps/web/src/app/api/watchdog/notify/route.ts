import { NextResponse } from 'next/server';

/**
 * 🕵️ WATCHDOG NOTIFIER (NUCLEAR 2026)
 * 
 * Doel: Johfrah direct informeren bij kritieke app-fouten.
 * Verstuurt technische details naar johfrah@voices.be.
 */

export async function POST(request: Request) {
  try {
    const { message, cause, url, digest } = await request.json();
    const recipient = 'johfrah@voices.be';
    
    console.error(`🚨 [WATCHDOG] Error detected at ${url}: ${message}`);

    // 1. Prepare Email Content
    const emailBody = `
      🚨 VOICES WATCHDOG ALERT (2026)
      
      Er is een kritieke fout opgetreden op de live site.
      
      📍 URL: ${url}
      ❌ FOUT: ${message}
      🔍 OORZAAK: ${cause || 'Onbekend'}
      🆔 DIGEST: ${digest || 'Geen digest'}
      
      Tijdstip: ${new Date().toLocaleString('nl-BE')}
      Status: Voices Engine probeert te herstellen...
    `;

    // 2. Call Internal Email Service (Bypass auth for system alerts)
    const emailServiceUrl = process.env.EMAIL_SERVICE_URL || 'http://localhost:3001';
    
    // We loggen het voor nu ook naar de server console
    console.log('📧 Sending Watchdog Alert to:', recipient);

    try {
      const response = await fetch(`${emailServiceUrl}/api/v2/emails/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: `🚨 VOICES ALERT: ${message.substring(0, 50)}`,
          template: 'raw',
          context: {
            content: emailBody,
            skip_approval: true
          }
        }),
      });

      if (!response.ok) {
        console.error('❌ Watchdog: Email service failed to respond correctly');
      }
    } catch (emailError) {
      console.error('❌ Watchdog: Could not reach email service:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Watchdog Notify API Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
