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
      greeting: `Hoi ${name},`,
      body: `Geweldig dat je meedoet aan de workshop **${workshopName}**. We hebben de koffie (en de microfoons) al bijna klaarstaan.`,
      detailsTitle: 'Details van je bezoek:',
      dateLabel: 'Datum:',
      timeLabel: 'Tijd:',
      locationLabel: 'Locatie:',
      button: 'Bekijk in je dashboard',
      footer: 'Heb je nog vragen? Antwoord gerust op deze mail of bel ons direct.'
    },
    // ... andere talen kunnen hier ...
  }[language as 'nl'] || content.nl;

  const html = `
    <h1 style="font-weight: 200; font-size: 28px; margin-bottom: 24px;">${content.title}</h1>
    <p>${content.greeting}</p>
    <p>${content.body}</p>
    
    <div style="background-color: #F9F9F7; border-radius: 16px; padding: 24px; margin-top: 32px;">
      <h3 style="margin-top: 0; font-weight: 400;">${content.detailsTitle}</h3>
      <p style="margin-bottom: 8px;"><strong>${content.dateLabel}</strong> ${date}</p>
      <p style="margin-bottom: 8px;"><strong>${content.timeLabel}</strong> ${time}</p>
      <p style="margin-bottom: 0;"><strong>${content.locationLabel}</strong> ${location}</p>
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://${host}/account/orders" class="button">${content.button}</a>
    </div>
    
    <p style="margin-top: 40px; font-size: 13px; opacity: 0.6;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.body,
    journey: 'studio',
    host
  });
}
