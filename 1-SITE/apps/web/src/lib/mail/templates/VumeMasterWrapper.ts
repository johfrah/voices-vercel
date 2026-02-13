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
        <h1 style="margin: 0; color: #FFFFFF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 900; font-size: 24px; text-transform: uppercase; letter-spacing: 0.1em;">
          ${title}
        </h1>
      </td>
    </tr>
  `;

  // ✍️ Mark's Signature Logic (Personal & Authoritative)
  let signatureHtml = '';
  if (showSignature) {
    if (journey === 'studio') {
      signatureHtml = `
        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #F0F0F0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <p style="margin: 0; color: #666; font-size: 14px;">Warme groeten,</p>
          <p style="margin: 5px 0 0 0; font-weight: 700; color: #1A1A1A; font-size: 16px;">Bernadette & Johfrah</p>
          <p style="margin: 10px 0 0 0; font-size: 13px;">
            <a href="https://www.voices.be/studio/" style="color: #FFB300; text-decoration: none; font-weight: 700;">www.voices.be/studio/</a>
          </p>
        </div>
      `;
    } else {
      signatureHtml = `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; border-top: 1px solid #F0F0F0; padding-top: 30px;">
          <tr>
            <td width="70" style="vertical-align: middle; padding-right: 20px;">
              <img src="https://www.voices.be/assets/common/branding/founder/johfrah-avatar-be.png" 
                   alt="Johfrah" width="70" height="70" style="display: block; border-radius: 50%; border: 2px solid #F0F0F0;" />
            </td>
            <td style="vertical-align: middle; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <p style="margin: 0; font-weight: 700; color: ${isDark ? '#FFFFFF' : '#1A1A1A'}; font-size: 16px;">Johfrah Lefebvre</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; color: ${isDark ? '#999' : '#666'};">Founder & Voice Expert</p>
              <p style="margin: 8px 0 0 0; font-size: 13px;">
                <a href="https://www.voices.be" style="color: #5CAED1; text-decoration: none; font-weight: 700;">www.voices.be</a>
              </p>
            </td>
          </tr>
        </table>
      `;
    }
  }

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
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.04);">
              <!-- LOGO HEADER -->
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <img src="https://www.voices.be/assets/common/branding/email/logos/email-logo.png" alt="Voices.be" width="120" style="display: block; border: 0;" />
                </td>
              </tr>
              
              <!-- DYNAMIC HEADER (IMAGE OR BANNER) -->
              ${headerHtml}

              <!-- CONTENT -->
              <tr>
                <td style="padding: 50px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: 400;">
                  ${content}
                  ${signatureHtml}
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
