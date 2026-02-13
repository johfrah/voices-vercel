import { MarketManager } from '@config/market-manager';

/**
 * 🏛️ VUME MASTER WRAPPER (2026) - MARK & LAYA EDITION
 * 
 * DNA: De perfecte balans tussen de krachtige legacy (Mark) en de moderne esthetiek (Laya).
 * 🛡️ Chris-Protocol: Volledig inline styling voor maximale compatibiliteit.
 */

interface WrapperOptions {
  title: string;
  previewText?: string;
  journey?: 'agency' | 'artist' | 'portfolio' | 'studio' | 'auth';
  market?: string;
  host?: string;
  showSignature?: boolean;
  headerImage?: string;
}

export function VumeMasterWrapper(content: string, options: WrapperOptions) {
  const { title, previewText, journey = 'agency', host = 'voices.be', showSignature = true, headerImage } = options;
  const market = MarketManager.getCurrentMarket(host);
  
  // 🎨 Laya's Refined Gradients (Based on Legacy, but smoother)
  const gradients = {
    agency: 'linear-gradient(135deg, #83CBBC 0%, #5CAED1 100%)',
    studio: 'linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)',
    artist: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
    auth: 'linear-gradient(135deg, #83CBBC 0%, #5CAED1 100%)',
    portfolio: 'linear-gradient(135deg, #FBFBF9 0%, #E0E0E0 100%)'
  };

  const primaryGradient = gradients[journey] || gradients.agency;
  const isDark = journey === 'artist';

  // 🖼️ Header Logic: Specific image or dynamic banner
  const headerHtml = headerImage ? `
    <tr>
      <td align="center" style="padding: 0; overflow: hidden; border-radius: 20px 20px 0 0;">
        <img src="${headerImage}" alt="${title}" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" />
      </td>
    </tr>
  ` : `
    <tr>
      <td align="center" style="background: ${primaryGradient}; padding: 40px 20px; border-radius: 20px 20px 0 0;">
        <h1 style="margin: 0; color: #FFFFFF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; font-size: 24px; letter-spacing: -0.02em;">
          ${title}
        </h1>
      </td>
    </tr>
  `;

  const signatureHtml = showSignature ? `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; border-top: 1px solid #F0F0F0; padding-top: 30px;">
      <tr>
        <td width="100" style="vertical-align: middle; text-align: center;">
          <a href="https://www.voices.be/?utm_source=E-mail&utm_medium=be-mail" style="text-decoration: none;">
            <img src="https://www.voices.be/wp-content/uploads/2024/07/johfrah.png" alt="Johfrah" width="100" style="display: block; border: 0; margin: auto;" />
          </a>
        </td>
        <td style="vertical-align: middle; padding-left: 31px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">
          <span style="font-weight: 700; color: ${isDark ? '#FFFFFF' : '#1A1A1A'};">Johfrah Lefebvre</span><br />
          <a href="mailto:johfrah@voices.be" style="color: ${isDark ? '#999' : '#666'}; text-decoration: none;">johfrah@voices.be</a><br />
          <a href="tel:+3227931991" style="color: ${isDark ? '#999' : '#666'}; text-decoration: none;">+3227931991</a><br />
          <a href="https://www.voices.be/?utm_source=E-mail&utm_medium=be-mail" style="color: #1155CC; text-decoration: none; font-weight: 500;">www.voices.be</a>
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
    <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      ${previewText ? `<div style="display:none; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${previewText}</div>` : ''}
      
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAFAFA; padding-bottom: 60px;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
              <!-- LOGO ABOVE CARD -->
              <tr>
                <td align="center" style="padding-bottom: 40px;">
                  <img src="https://www.voices.be/assets/common/branding/email/logos/email-logo.png" alt="Voices.be" width="140" style="display: block; border: 0;" />
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.04);">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <!-- DYNAMIC HEADER (IMAGE OR BANNER) -->
                    ${headerHtml}

                    <!-- CONTENT -->
                    <tr>
                      <td style="padding: 50px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 400;">
                        ${content}
                        ${signatureHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- FOOTER & BRANDING -->
              <tr>
                <td align="center" style="padding: 40px; border-top: 1px solid #F0F0F0; background-color: #FFFFFF;">
                  <div style="font-size: 11px; color: #CCCCCC; text-transform: uppercase; letter-spacing: 0.1em;">
                    Voices.be &bull; Jules Delhaizestraat 42/2, 1080 Brussel &bull; +32 (0)2 793 19 91
                  </div>
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
