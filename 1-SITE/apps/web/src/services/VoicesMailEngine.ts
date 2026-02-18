import { DirectMailService } from './DirectMailService';

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
  private getHtmlWrapper(content: string, lang: string = 'nl'): string {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Voices.be</title>
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
              <div style="font-size: 13px; letter-spacing: 0.4em; text-transform: uppercase; color: #cccccc;">Voices</div>
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
                © 2026 Voices.be
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
  }) {
    const lang = options.lang || 'nl';
    
    const contentHtml = `
      <h1 style="font-size: 36px; font-weight: 200; letter-spacing: -0.02em; margin: 0 0 24px 0; color: #1a1a1a;">${options.title}</h1>
      <p style="font-size: 16px; font-weight: 300; line-height: 1.6; color: #666666; margin: 0 0 40px 0;">${options.body}</p>
      ${options.buttonUrl ? `
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="border-radius: 12px;" bgcolor="#1a1a1a">
              <a href="${options.buttonUrl}" target="_blank" style="font-size: 14px; font-weight: 400; color: #ffffff; text-decoration: none; padding: 20px 40px; border-radius: 12px; border: 1px solid #1a1a1a; display: inline-block; letter-spacing: 0.1em; text-transform: uppercase;">
                ${options.buttonText || (lang === 'nl' ? 'Klik hier' : lang === 'fr' ? 'Cliquez ici' : 'Click here')}
              </a>
            </td>
          </tr>
        </table>
      ` : ''}
    `;

    const fullHtml = this.getHtmlWrapper(contentHtml, lang);
    
    // Plain text fallback voor clients die geen HTML lusten
    const plainText = `${options.title}\n\n${options.body}\n\n${options.buttonUrl ? `${options.buttonText || 'Link'}: ${options.buttonUrl}` : ''}\n\n© 2026 Voices.be`;

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
  public async sendMagicLink(email: string, link: string, lang: string = 'nl', host?: string) {
    const templates: Record<string, any> = {
      nl: {
        subject: 'Inloglink voor Voices.be',
        title: 'Welkom terug.',
        body: 'U heeft een verzoek ingediend om in te loggen op uw account. Gebruik de onderstaande knop om direct toegang te krijgen tot uw cockpit.',
        buttonText: 'Direct inloggen'
      },
      en: {
        subject: 'Login link for Voices.be',
        title: 'Welcome back.',
        body: 'You requested a login link for your account. Use the button below to gain direct access to your cockpit.',
        buttonText: 'Log in now'
      },
      fr: {
        subject: 'Lien de connexion pour Voices.be',
        title: 'Bon retour.',
        body: 'Vous avez demandé un lien de connexion pour votre compte. Utilisez le bouton ci-dessous pour accéder directement à votre cockpit.',
        buttonText: 'Se connecter maintenant'
      }
    };

    const t = templates[lang] || templates.nl;

    await this.sendVoicesMail({
      to: email,
      subject: t.subject,
      title: t.title,
      body: t.body,
      buttonText: t.buttonText,
      buttonUrl: link,
      lang,
      host
    });
  }
}
