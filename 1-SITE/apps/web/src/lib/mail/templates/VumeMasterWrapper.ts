import { MarketManager } from '@config/market-manager';

/**
 * 🏛️ VUME MASTER WRAPPER (2026) - INLINE EDITION
 * 
 * DNA: Johfrah (Luxe), Moby (Mobile-First), Laya (Esthetiek).
 * 🛡️ Chris-Protocol: Volledig inline styling voor maximale compatibiliteit.
 */

interface WrapperOptions {
  title: string;
  previewText?: string;
  journey?: 'agency' | 'artist' | 'portfolio' | 'studio' | 'auth';
  market?: string;
  host?: string;
  showSignature?: boolean;
}

export function VumeMasterWrapper(content: string, options: WrapperOptions) {
  const { title, previewText, journey = 'agency', host = 'voices.be', showSignature = true } = options;
  const market = MarketManager.getCurrentMarket(host);
  
  const dna = {
    agency: { bg: '#FBFBF9', card: '#FFFFFF', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' },
    artist: { bg: '#000000', card: '#111111', accent: '#FF007A', text: '#FFFFFF', secondary: '#9CA3AF' },
    portfolio: { bg: '#FFFFFF', card: '#FBFBF9', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' },
    studio: { bg: '#FBFBF9', card: '#FFFFFF', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' },
    auth: { bg: '#FBFBF9', card: '#FFFFFF', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' }
  }[journey];

  const signatureHtml = showSignature ? `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; border-top: 1px solid #F0F0F0; padding-top: 30px;">
      <tr>
        <td width="60" style="vertical-align: top; padding-right: 20px;">
          <img src="https://www.voices.be/assets/common/founder/johfrah-avatar-be.png" alt="Johfrah Lefebvre" width="60" height="60" style="display: block; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.05);" />
        </td>
        <td style="vertical-align: middle;">
          <p style="margin: 0; font-size: 15px; font-weight: 500; color: #1A1A1A;">Johfrah Lefebvre</p>
          <p style="margin: 2px 0 0 0; font-size: 13px; color: #6B7280; font-weight: 300;">Founder Voices.be</p>
        </td>
      </tr>
    </table>
  ` : '';

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="nl">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${dna.bg}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      ${previewText ? `<div style="display:none; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${previewText}</div>` : ''}
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${dna.bg};">
        <tr>
          <td align="center" style="padding: 60px 20px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <!-- LOGO -->
              <tr>
                <td align="center" style="padding-bottom: 50px;">
                  <img src="https://www.voices.be/wp-content/uploads/2023/05/Voices-Logo-Black.png" alt="Voices" width="140" style="display: block; border: 0;" />
                </td>
              </tr>
              
              <!-- CARD -->
              <tr>
                <td style="background-color: ${dna.card}; padding: 50px; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.04); border: 1px solid ${journey === 'artist' ? '#222222' : '#F0F0F0'};">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: ${dna.text}; font-size: 16px; line-height: 1.8; font-weight: 300; letter-spacing: 0.01em;">
                        ${content}
                        ${signatureHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- FOOTER -->
              <tr>
                <td align="center" style="padding-top: 60px; color: ${dna.secondary}; font-size: 11px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;">
                  &copy; 2026 ${market.company_name} &bull; Voices.be
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
