import { VumeMasterWrapper } from './VumeMasterWrapper';

/**
 * 🎨 VUME STUDIO EXPERIENCE TEMPLATE (2026)
 * 
 * DNA: Berny (Studio Captain), Johfrah (Luxe).
 */

interface StudioExperienceOptions {
  name: string;
  workshopName: string;
  date: string;
  time: string;
  location?: string;
  host?: string;
  language?: string;
}

export function VumeStudioTemplate(options: StudioExperienceOptions) {
  const { name, workshopName, date, time, location = 'Voices Studio, Gent', host = 'voices.be', language = 'nl' } = options;

  const content = {
    nl: {
      title: 'Je plek in de studio is gereserveerd',
      greeting: `Beste ${name},`,
      body: `Geweldig dat je meedoet aan de workshop <strong style="color: #000;">${workshopName}</strong>. We hebben de koffie (en de microfoons) al bijna klaarstaan.`,
      detailsTitle: 'Details van je bezoek:',
      dateLabel: 'Datum:',
      timeLabel: 'Tijd:',
      locationLabel: 'Locatie:',
      button: 'BEKIJK IN DASHBOARD',
      footer: 'Heb je nog vragen? Antwoord gerust op deze mail of bel ons direct.'
    },
  }[language as 'nl'] || content.nl;

  const html = `
    <p style="margin: 0 0 20px 0;">${content.greeting}</p>
    <p style="margin: 0 0 32px 0;">${content.body}</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FBFBF9; border-radius: 10px; border: 1px solid #F0F0F0; margin-bottom: 32px;">
      <tr>
        <td style="padding: 24px;">
          <h3 style="margin: 0 0 15px 0; font-weight: 700; font-size: 16px; color: #1A1A1A;">${content.detailsTitle}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">${content.dateLabel} <span style="color: #1A1A1A; font-weight: 500;">${date}</span></p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">${content.timeLabel} <span style="color: #1A1A1A; font-weight: 500;">${time}</span></p>
          <p style="margin: 0; font-size: 14px; color: #6B7280;">${content.locationLabel} <span style="color: #1A1A1A; font-weight: 500;">${location}</span></p>
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://${host}/account/orders" style="display: inline-block; padding: 18px 36px; background-color: #000000; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em;">${content.button}</a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 40px 0 0 0; font-size: 13px; opacity: 0.6; line-height: 1.6;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.title,
    journey: 'studio',
    host
  });
}
