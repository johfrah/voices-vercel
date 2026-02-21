import https from 'https';

/**
 * 📞 FONZER TELEPHONY SERVICE (2026)
 * 
 * Deze service regelt de communicatie met de Fonzer API voor 'Call Origination'.
 * Het Chris-Protocol dwingt af dat we eerst een OAuth token ophalen voordat we
 * de eigenlijke bel-actie uitvoeren.
 * 
 * LET OP: Vanwege een certificaat-mismatch bij api.fonzer.com (DNS mismatch),
 * gebruiken we de onderliggende domeinnaam van hun certificaat: api.smartcloudcommunications.com
 */

export class FonzerService {
  private static instance: FonzerService;
  private clientId: string;
  private clientSecret: string;
  // We gebruiken het directe domein van het certificaat om TLS fouten te voorkomen
  private baseUrl = 'api.smartcloudcommunications.com';

  private constructor() {
    this.clientId = process.env.FONZER_CLIENT_ID || '';
    this.clientSecret = process.env.FONZER_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.error('[FonzerService] Missing credentials in .env.local');
    }
  }

  public static getInstance(): FonzerService {
    if (!FonzerService.instance) {
      FonzerService.instance = new FonzerService();
    }
    return FonzerService.instance;
  }

  /**
   * Helper om HTTPS requests te doen met de ingebouwde https module
   * Dit is betrouwbaarder voor custom certificaat/host combinaties.
   */
  private async makeRequest(path: string, method: string, body: any, token?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const isTokenRequest = path.includes('token');
      
      const options: https.RequestOptions = {
        hostname: this.baseUrl,
        port: 443,
        path: `/v1${path}`,
        method: method,
        headers: {
          'Accept': 'application/json',
        }
      };

      if (token) {
        options.headers!['Authorization'] = `Bearer ${token}`;
      }

      let postData = '';
      if (isTokenRequest) {
        options.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
        postData = new URLSearchParams(body).toString();
      } else {
        options.headers!['Content-Type'] = 'application/json';
        postData = JSON.stringify(body);
      }

      options.headers!['Content-Length'] = Buffer.byteLength(postData);

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => responseBody += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseBody));
            } catch (e) {
              resolve(responseBody);
            }
          } else {
            console.error(`[FonzerService] Request failed (${res.statusCode}):`, responseBody);
            reject(new Error(`Status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (e) => {
        console.error('[FonzerService] Socket error:', e);
        reject(e);
      });
      
      req.write(postData);
      req.end();
    });
  }

  /**
   * Haalt een OAuth Access Token op bij Fonzer
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      console.log('[FonzerService] Requesting token...');
      
      const data = await this.makeRequest('/oauth/token', 'POST', {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      return data.access_token;
    } catch (error) {
      console.error('[FonzerService] Auth failed:', error);
      return null;
    }
  }

  /**
   * Start een 'Call Origination' (Callback)
   * @param destination Het telefoonnummer van de bezoeker
   */
  public async initiateCallback(destination: string): Promise<{ success: boolean; message: string }> {
    const token = await this.getAccessToken();
    if (!token) {
      return { 
        success: false, 
        message: 'De studio-verbinding is momenteel niet beschikbaar. Probeer het later nog eens of bel ons direct.' 
      };
    }

    const extension = process.env.FONZER_INTERNAL_EXTENSION || '1991';
    const callerId = process.env.FONZER_PHONE_NUMBER || '+3227931991';

    try {
      console.log(`[FonzerService] Attempting originate: ${extension} -> ${destination}`);
      
      await this.makeRequest('/call/originate', 'POST', {
        extension: extension,
        destination: destination,
        caller_id: callerId,
        auto_answer: true,
      }, token);

      return { success: true, message: 'Verbinding wordt opgezet...' };
    } catch (error) {
      console.error('[FonzerService] Originate failed:', error);
      return { 
        success: false, 
        message: 'Het opzetten van de verbinding is mislukt. Onze excuses voor het ongemak.' 
      };
    }
  }
}
