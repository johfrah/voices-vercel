import { VumeMasterWrapper } from './VumeMasterWrapper';

/**
 * 🔑 VUME MAGIC LINK TEMPLATE (2026)
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
      title: 'Welkom terug in de Schouwburg',
      greeting: name ? `Hoi ${name},` : 'Hoi,',
      body: 'Je bent slechts één klik verwijderd van je cockpit. We hebben alles voor je klaargezet.',
      button: 'Direct inloggen',
      footer: 'Deze link is 15 minuten geldig. Heb je deze mail niet aangevraagd? Dan kun je hem veilig negeren.'
    },
    fr: {
      title: 'Bienvenue au Théâtre des Voix',
      greeting: name ? `Bonjour ${name},` : 'Bonjour,',
      body: 'Vous n\'êtes qu\'à un clic de votre cockpit. Nous avons tout préparé pour vous.',
      button: 'Se connecter maintenant',
      footer: 'Ce lien is valable 15 minutes. Vous n\'avez pas demandé cet e-mail ? Vous pouvez l\'ignorer en toute sécurité.'
    },
    en: {
      title: 'Welcome back to the Theater',
      greeting: name ? `Hi ${name},` : 'Hi there,',
      body: 'You\'re just one click away from your cockpit. Everything is ready for you.',
      button: 'Login directly',
      footer: 'This link is valid for 15 minutes. Didn\'t request this email? You can safely ignore it.'
    }
  }[language as 'nl' | 'fr' | 'en'] || content.nl;

  const html = `
    <h1 style="font-weight: 200; font-size: 28px; margin-bottom: 24px;">${content.title}</h1>
    <p>${content.greeting}</p>
    <p>${content.body}</p>
    <div style="text-align: center; margin-top: 32px;">
      <a href="${link}" class="button">${content.button}</a>
    </div>
    <p style="margin-top: 40px; font-size: 13px; opacity: 0.6;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.body,
    journey: 'auth',
    host
  });
}
