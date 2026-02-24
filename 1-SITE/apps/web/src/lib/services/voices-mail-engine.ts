import { DirectMailService } from './direct-mail-service';

/**
 * VOICES MAIL ENGINE (BOB-METHOD 2026)
 * 
 * De centrale motor voor alle uitgaande e-mails.
 * Dwingt de Voices-stijl, taal (Voiceglot) en betrouwbare links af.
 */
export class VoicesMailEngine {
  private static instance: VoicesMailEngine;
  private mailService: DirectMailService;

  private constructor() {
    this.mailService = DirectMailService.getInstance();
  }

  public static getInstance(): VoicesMailEngine {
    if (!VoicesMailEngine.instance) {
      VoicesMailEngine.instance = new VoicesMailEngine();
    }
    return VoicesMailEngine.instance;
  }

  /**
   * Genereert de standaard Voices HTML wrapper
   * Geoptimaliseerd voor maximale compatibiliteit (Spark, Outlook, Gmail)
   */
  private getHtmlWrapper(content: string, lang: string = 'nl-BE', marketName: string = 'Voices', logoUrl?: string): string {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${marketName}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@200;300;400&display=swap');
    body { 
      font-family: 'Raleway', Helvetica, Arial, sans-serif; 
      background-color: #fcfaf7; 
      color: #1a1a1a; 
      margin: 0; 
      padding: 0; 
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fcfaf7; font-family: 'Raleway', Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fcfaf7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 40px; padding: 60px 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.02);">
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${marketName}" width="120" style="display: block; outline: none; border: none; height: auto;" />` : `<div style="font-size: 13px; letter-spacing: 0.4em; text-transform: uppercase; color: #cccccc;">${marketName}</div>`}
            </td>
          </tr>
          <tr>
            <td align="center">
              ${content}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 40px;">
              <div style="width: 40px; height: 1px; background-color: #eeeeee; margin-bottom: 30px;"></div>
              <div style="font-size: 10px; letter-spacing: 0.2em; color: #bbbbbb; text-transform: uppercase;">
                © 2026 ${marketName}
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

  /**
   * Verstuurt een gestileerde Voices e-mail met meertalige ondersteuning
   */
  public async sendVoicesMail(options: {
    to: string;
    subject: string;
    title: string;
    body: string;
    buttonText?: string;
    buttonUrl?: string;
    from?: string;
    host?: string;
    lang?: string;
    marketName?: string;
  }) {
    const lang = options.lang || 'nl-BE';
    const marketName = options.marketName || 'Voices';
    
    // 🛡️ CHRIS-PROTOCOL: Fetch market config for logo and branding
    const { MarketManagerServer: MarketManager } = require('../system/market-manager-server');
    const market = MarketManager.getCurrentMarket(options.host);
    const logoUrl = market.logo_url;
    
    const contentHtml = `
      <h1 style="font-size: 36px; font-weight: 200; letter-spacing: -0.02em; margin: 0 0 24px 0; color: #1a1a1a;">${options.title}</h1>
      <p style="font-size: 16px; font-weight: 300; line-height: 1.6; color: #666666; margin: 0 0 40px 0;">${options.body}</p>
      ${options.buttonUrl ? `
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="border-radius: 12px;" bgcolor="#1a1a1a">
              <a href="${options.buttonUrl}" target="_blank" style="font-size: 14px; font-weight: 400; color: #ffffff; text-decoration: none; padding: 20px 40px; border-radius: 12px; border: 1px solid #1a1a1a; display: inline-block; letter-spacing: 0.1em; text-transform: uppercase;">
                ${options.buttonText || (lang.startsWith('nl') ? 'Klik hier' : lang.startsWith('fr') ? 'Cliquez ici' : 'Click here')}
              </a>
            </td>
          </tr>
        </table>
      ` : ''}
    `;

    const fullHtml = this.getHtmlWrapper(contentHtml, lang, marketName, logoUrl);
    
    // Plain text fallback voor clients die geen HTML lusten
    const plainText = `${options.title}\n\n${options.body}\n\n${options.buttonUrl ? `${options.buttonText || 'Link'}: ${options.buttonUrl}` : ''}\n\n© 2026 ${marketName}`;

    await this.mailService.sendMail({
      to: options.to,
      subject: options.subject,
      html: fullHtml,
      text: plainText,
      from: options.from,
      host: options.host
    });
  }

  /**
   * Specifieke helper voor de Magic Link (meertalig)
   */
  public async sendMagicLink(email: string, link: string, lang: string = 'nl-BE', host?: string) {
    const { MarketManagerServer: MarketManager } = require('../system/market-manager-server');
    const market = MarketManager.getCurrentMarket(host);
    const marketName = market.name || 'Voices';

    const templates: Record<string, any> = {
      'nl-be': {
        subject: `Inloglink voor ${marketName}`,
        title: 'Welkom terug.',
        body: 'U heeft een verzoek ingediend om in te loggen op uw account. Gebruik de onderstaande knop om direct toegang te krijgen tot uw account.',
        buttonText: 'Direct inloggen'
      },
      'en-gb': {
        subject: `Login link for ${marketName}`,
        title: 'Welcome back.',
        body: 'You requested a login link for your account. Use the button below to gain direct access to your account.',
        buttonText: 'Log in now'
      },
      'fr-fr': {
        subject: `Lien de connexion voor ${marketName}`,
        title: 'Bon retour.',
        body: 'Vous avez demandé un lien de connexion voor uw account. Utilisez le bouton ci-dessous pour accéder directement à votre account.',
        buttonText: 'Se connecter maintenant'
      }
    };

    const t = templates[lang.toLowerCase()] || templates['nl-be'];

    await this.sendVoicesMail({
      to: email,
      subject: t.subject,
      title: t.title,
      body: t.body,
      buttonText: t.buttonText,
      buttonUrl: link,
      lang,
      host,
      marketName
    });
  }

  /**
   * Verstuurt een alert naar de stemacteur bij nieuwe interesse op hun portfolio
   */
  public async sendPortfolioLeadAlert(options: {
    to: string;
    actorName: string;
    leadName: string;
    vibe: string;
    message?: string;
    dashboardUrl: string;
    host?: string;
    lang?: string;
  }) {
    const lang = options.lang || 'nl-BE';
    const isBurning = options.vibe === 'burning';
    
    const templates: Record<string, any> = {
      'nl-be': {
        subject: `${isBurning ? '🔥' : '🎯'} Nieuwe interesse op je portfolio`,
        title: isBurning ? 'Iemand staat in lichterlaaie.' : 'Nieuwe interesse.',
        body: `Hallo ${options.actorName}, er is zojuist een warme lead gedetecteerd op je portfolio. <strong>${options.leadName}</strong> toont veel interesse in je werk.${options.message ? `<br/><br/><em>"${options.message}"</em>` : ''}`,
        buttonText: 'Bekijk Klant DNA'
      },
      'en-gb': {
        subject: `${isBurning ? '🔥' : '🎯'} New interest on your portfolio`,
        title: isBurning ? 'Someone is on fire.' : 'New interest.',
        body: `Hi ${options.actorName}, a warm lead was just detected on your portfolio. <strong>${options.leadName}</strong> is showing a lot of interest in your work.${options.message ? `<br/><br/><em>"${options.message}"</em>` : ''}`,
        buttonText: 'View Customer DNA'
      }
    };

    const t = templates[lang.toLowerCase()] || templates['nl-be'];

    await this.sendVoicesMail({
      to: options.to,
      subject: t.subject,
      title: t.title,
      body: t.body,
      buttonText: t.buttonText,
      buttonUrl: options.dashboardUrl,
      lang,
      host: options.host
    });
  }
}
