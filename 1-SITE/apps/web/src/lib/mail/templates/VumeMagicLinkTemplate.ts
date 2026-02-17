import { VumeMasterWrapper } from './VumeMasterWrapper';

/**
 *  VUME MAGIC LINK TEMPLATE (2026)
 * 
 * DNA: Mark (Warmte), Moby (Thumb-Zone).
 */

interface MagicLinkOptions {
  name?: string;
  link: string;
  host?: string;
  language?: string;
}

export function VumeMagicLinkTemplate(options: MagicLinkOptions) {
  const { name, link, host = 'voices.be', language = 'nl' } = options;

  const content = {
    nl: {
      title: 'Welkom terug',
      greeting: name ? `Beste ${name},` : 'Beste,',
      body: 'Je bent slechts n klik verwijderd van je cockpit. We hebben alles voor je klaargezet.',
      button: 'DIRECT INLOGGEN',
      footer: 'Deze link is 15 minuten geldig. Heb je deze mail niet aangevraagd? Dan kun je hem veilig negeren.'
    },
    fr: {
      title: 'Bienvenue',
      greeting: name ? `Cher ${name},` : 'Cher,',
      body: 'Vous n\'tes qu\' un clic de votre cockpit. Nous avons tout prpar pour vous.',
      button: 'SE CONNECTER MAINTENANT',
      footer: 'Ce lien est valable 15 minutes. Vous n\'avez pas demand cet e-mail ? Vous pouvez l\'ignorer en toute scurit.'
    },
    en: {
      title: 'Welcome back',
      greeting: name ? `Dear ${name},` : 'Dear,',
      body: 'You\'re just one click away from your cockpit. Everything is ready for you.',
      button: 'LOGIN DIRECTLY',
      footer: 'This link is valid for 15 minutes. Didn\'t request this email? You can safely ignore it.'
    }
  }[language as 'nl' | 'fr' | 'en'] || content.nl;

  const html = `
    <p style="margin: 0 0 20px 0; font-family: 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${content.greeting}</p>
    <p style="margin: 0 0 32px 0; font-family: 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${content.body}</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" style="padding: 10px 0 20px 0;">
          <a href="${link}" style="display: inline-block; padding: 18px 36px; background-color: #000000; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; font-family: 'Raleway', sans-serif;">${content.button}</a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 40px 0 0 0; font-size: 13px; opacity: 0.6; line-height: 1.6; font-family: 'Raleway', sans-serif;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.body,
    journey: 'auth',
    host
  });
}
