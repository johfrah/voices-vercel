import { BaseTemplate } from './VumeMasterWrapper';

/**
 * 👋 NEW ACCOUNT TEMPLATE (2026)
 * 
 * Doel: Welkomstbericht voor nieuwe klanten na hun eerste bestelling of aanvraag.
 */

interface NewAccountProps {
  name: string;
  host?: string;
  language?: string;
}

export const VumeNewAccountTemplate = (props: NewAccountProps) => {
  const { name, host, language = 'nl' } = props;
  const isNl = language === 'nl';

  const content = `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #1a1a1a;">${isNl ? 'Welkom bij Voices,' : 'Welcome to Voices,'} ${name}!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #666;">
        ${isNl 
          ? 'Je account is succesvol aangemaakt. Vanaf nu heb je direct toegang tot je eigen dashboard waar je projecten kunt volgen, scripts kunt beheren en facturen kunt downloaden.' 
          : 'Your account has been successfully created. From now on, you have direct access to your own dashboard where you can track projects, manage scripts, and download invoices.'}
      </p>
    </div>

    <div style="background: #fcfaf7; border-radius: 20px; padding: 25px; border: 1px solid #eee; margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 15px;">${isNl ? 'Jouw Voordelen' : 'Your Benefits'}</div>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li style="margin-bottom: 10px; font-size: 14px; color: #1a1a1a; display: flex; align-items: center;">
          <span style="color: #ff4f00; margin-right: 10px;">✓</span> ${isNl ? 'Directe status-updates van je opnames' : 'Real-time status updates of your recordings'}
        </li>
        <li style="margin-bottom: 10px; font-size: 14px; color: #1a1a1a; display: flex; align-items: center;">
          <span style="color: #ff4f00; margin-right: 10px;">✓</span> ${isNl ? 'Al je facturen op één plek' : 'All your invoices in one place'}
        </li>
        <li style="margin-bottom: 10px; font-size: 14px; color: #1a1a1a; display: flex; align-items: center;">
          <span style="color: #ff4f00; margin-right: 10px;">✓</span> ${isNl ? 'Sla je favoriete stemmen op' : 'Save your favorite voices'}
        </li>
      </ul>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="https://${host || 'www.voices.be'}/account" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 18px 35px; text-decoration: none; border-radius: 15px; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; font-size: 13px;">
        ${isNl ? 'Naar mijn account' : 'Go to my account'}
      </a>
    </div>

    <div style="font-size: 14px; color: #999; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px;">
      ${isNl 
        ? 'Je hoeft geen wachtwoord te onthouden. Je kunt altijd veilig inloggen via een "Magische Link" die we naar je e-mail sturen.' 
        : 'No need to remember a password. You can always log in securely via a "Magic Link" we send to your email.'}
    </div>
  `;

  return BaseTemplate({
    title: isNl ? 'Welkom bij Voices' : 'Welcome to Voices',
    journey: 'agency',
    market: 'BE',
    children: content
  });
};
