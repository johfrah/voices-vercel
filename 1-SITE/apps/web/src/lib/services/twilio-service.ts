import { Twilio } from 'twilio';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

export class twilio-service {
  private static instance: twilio-service;
  private client: Twilio;
  private fromNumber: string;
  private myPersonalNumber: string;

  private constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.myPersonalNumber = process.env.MY_PERSONAL_NUMBER || '';

    if (!accountSid || !authToken) {
      console.error('[twilio-service] Missing credentials');
    }

    this.client = new Twilio(accountSid, authToken);
  }

  public static getInstance(): twilio-service {
    if (!twilio-service.instance) {
      twilio-service.instance = new twilio-service();
    }
    return twilio-service.instance;
  }

  /**
   * Start een callback verbinding:
   * 1. Twilio belt Johfrah (+32475...)
   * 2. Zodra Johfrah opneemt, wordt de klant gebeld
   */
  public async initiateCallback(destination: string, host?: string): Promise<{ success: boolean; message: string }> {
    try {
      const market = MarketManager.getCurrentMarket(host);
      const siteUrl = MarketManager.getMarketDomains()[market.market_code] || `https://${host || 'www.voices.be'}`;
      
      //  CHRIS-PROTOCOL: Fetch current config from DB for whisper mode
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/app_configs?key=eq.telephony_config`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        }
      });
      const configs = await response.json();
      const config = configs?.[0]?.value || { whisperMode: 'robot' };
      const whisperMode = config.whisperMode;

      console.log(`[twilio-service] Initiating callback. Mode: ${whisperMode}. Destination: ${destination} (Market: ${market.market_code})`);

      let twiml = '';
      
      if (whisperMode === 'audio') {
        twiml = `<Response><Play>${siteUrl}/assets/audio/system/call-intro-johfrah.mp3</Play><Dial>${destination}</Dial></Response>`;
      } else if (whisperMode === 'silent') {
        twiml = `<Response><Pause length="1"/><Dial>${destination}</Dial></Response>`;
      } else {
        // Default: Robot
        const spacedNumber = destination.split('').join(' ');
        twiml = `<Response>
          <Say voice="alice" language="${market.market_code === 'BE' ? 'nl-BE' : 'nl-NL'}">
            Inkomende oproep van ${market.name}. 
            Het nummer van de klant is: ${spacedNumber}. 
            We verbinden je nu.
          </Say>
          <Dial>${destination}</Dial>
        </Response>`;
      }

      const call = await this.client.calls.create({
        from: this.fromNumber,
        to: this.myPersonalNumber,
        twiml: twiml,
      });

      console.log(`[twilio-service] Call SID: ${call.sid}`);
      return { 
        success: true, 
        message: 'Je telefoon gaat nu over. Neem op om verbonden te worden met de klant.' 
      };
    } catch (error: any) {
      console.error('[twilio-service] Error:', error);
      return { 
        success: false, 
        message: `Twilio fout: ${error.message}` 
      };
    }
  }
}
