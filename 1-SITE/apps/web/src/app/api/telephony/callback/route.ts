import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/services/TwilioService';

/**
 * 📞 API ROUTE: CALLBACK REQUEST (2026)
 * 
 * Verwerkt inkomende verzoeken van de VoicyChat om een belverbinding op te zetten via Twilio.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ success: false, message: 'Telefoonnummer ontbreekt.' }, { status: 400 });
    }

    // LEX: Simpele validatie van het nummer
    let cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
    
    if (cleanNumber.startsWith('0') && !cleanNumber.startsWith('00')) {
      cleanNumber = '+32' + cleanNumber.substring(1);
    }
    
    if (cleanNumber.length < 9) {
      return NextResponse.json({ success: false, message: 'Ongeldig telefoonnummer.' }, { status: 400 });
    }

    const twilio = TwilioService.getInstance();
    const result = await twilio.initiateCallback(cleanNumber);

    //  TELEGRAM NOTIFICATIE (Altijd sturen bij Twilio start, zodat Johfrah het nummer ziet)
    if (result.success) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = '8167550943';
        if (botToken && chatId) {
          const message = `📞 *LIVE OPROEP GESTART*\n\nJe wordt nu verbonden met een klant op de site.\n\n*Nummer:* ${cleanNumber}\n\n_Neem je telefoon op om het gesprek te starten._`;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
          });
        }
      } catch (tgErr) {
        console.error('[API Telephony] Telegram notification failed:', tgErr);
      }
    }

    // FALLBACK PROTOCOL: Als Twilio faalt
    if (!result.success) {
      console.log('[API Telephony] Twilio failed, triggering Telegram fallback...');
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = '8167550943'; // Johfrah's correcte ID
        
        if (botToken && chatId) {
          const message = `📞 *BEL MIJ NU AANVRAAG*\n\nDe Twilio koppeling heeft een storing, maar deze klant wacht op de site:\n\n*Nummer:* ${cleanNumber}\n\n_Klik op het nummer om direct te bellen._`;
          
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'Markdown'
            }),
          });
          
          return NextResponse.json({ 
            success: true, 
            message: 'Je aanvraag is ontvangen! We bellen je zo snel mogelijk terug.' 
          });
        }
      } catch (tgErr) {
        console.error('[API Telephony] Telegram fallback failed:', tgErr);
      }
    }

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error('[API Telephony] Error:', error);
    return NextResponse.json({ success: false, message: 'Interne serverfout bij het opzetten van de verbinding.' }, { status: 500 });
  }
}
