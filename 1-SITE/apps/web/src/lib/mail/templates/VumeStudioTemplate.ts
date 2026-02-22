import { VumeMasterWrapper } from './VumeMasterWrapper';

/**
 *  VUME STUDIO EXPERIENCE TEMPLATE (2026)
 * 
 * DNA: Berny (Studio Captain), Johfrah (Luxe).
 *  Chris-Protocol: Volledig gezuiverd van dubbele footers en markdown slop.
 */

interface StudioExperienceOptions {
  name: string;
  workshopName: string;
  date: string;
  time: string;
  location?: string;
  host?: string;
  language?: string;
  headerImage?: string;
  instructorName?: string;
  instructorRole?: string;
  instructorImage?: string;
  description?: string;
  learningPoints?: string;
  schedule?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  aftermovieText?: string;
  optOutToken?: string;
  email?: string;
}

export function VumeStudioTemplate(options: StudioExperienceOptions) {
  const { 
    name, 
    workshopName, 
    date, 
    time, 
    location = 'Molenbeek (Jules Delhaizestraat 42-2, 1080 Molenbeek)', 
    host = (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be'), 
    language = 'nl', 
    headerImage,
    instructorName = 'Johfrah Lefebvre',
    instructorRole = 'Voice-over en coach',
    instructorImage = 'https://www.voices.be/assets/common/branding/founder/johfrah.png?v=20260213',
    description = 'In deze workshop leer je de basis van voice-overs inspreken: van stemopwarming tot tekstbegrip en intonatie en spreken in de microfoon.',
    learningPoints = 'Tijdens deze praktijkgerichte workshop werk je intensief met tekst en microfoon. Je doet niet alleen nieuwe vaardigheden op, maar gaat ook naar huis met een hoogwaardige opname.',
    schedule = '09u45: Aankomst\n10u00: Kennismaking\n10u15: Workshop deel 1\n13u30: Lunch\n14u15: Workshop deel 2\n17u00: Einde',
    videoThumbnail = `https://${host}/assets/studio/common/branding/VSTUDIO.webp`,
    videoUrl = `https://${host}/studio/`,
    aftermovieText = 'Ontdek hoe deelnemers hun stem leren inzetten om teksten echt te laten leven.',
    optOutToken,
    email
  } = options;

  const optOutUrl = (optOutToken && email) 
    ? `https://${host}/api/marketing/opt-out?email=${encodeURIComponent(email)}&token=${optOutToken}`
    : undefined;

  const content = {
    nl: {
      title: workshopName,
      greeting: `Hey ${name},`,
      intro: `Wil je je voice-over skills bijschaven of ontdekken hoe je ermee start? We hebben je plekje gereserveerd. Per workshop zijn er maximaal 4 deelnemers, zodat iedereen veel tijd achter de microfoon krijgt.`,
      reservationTitle: 'Jouw reservatie',
      instructorLabel: `Een workshop door ${instructorName},`,
      instructorTitle: instructorRole,
      aboutTitle: 'Over de workshop',
      learnTitle: 'Wat leer je?',
      scheduleTitle: 'Dagindeling',
      videoTitle: 'Zo verloopt de workshop (video)',
      instructorBioTitle: `Over ${instructorName}`,
      ctaTitle: 'Klaar om te beginnen?',
      ctaText: 'Bekijk je dashboard voor alle details.',
      button: 'NAAR DASHBOARD',
      footer: 'Warme groeten,<br>Bernadette en Johfrah',
      studioLink: `www.${host}/studio/`
    },
  }[language as 'nl'] || content.nl;

  const html = `
    <div style="font-family: 'Raleway', sans-serif;">
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #111;">${content.greeting}</p>
      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #111;">${content.intro}</p>
      
      <!-- RESERVATION CARD -->
      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #111;">${content.reservationTitle}</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 12px; margin-bottom: 30px;">
        <tr>
          <td style="padding: 20px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="60" style="vertical-align: top;">
                  <img src="${headerImage || `https://${host}/assets/studio/common/branding/VSTUDIO.webp`}" width="60" height="60" style="border-radius: 50%; object-fit: cover; border: 1px solid #eee; display: block;" />
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <div style="font-weight: 600; font-size: 16px; color: #111; margin-bottom: 4px;">${date}</div>
                  <div style="font-size: 14px; color: #555; margin-bottom: 4px;">${time}</div>
                  <div style="font-size: 14px; color: #555;">${location}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- ABOUT -->
      <p style="margin: 30px 0 15px 0; font-size: 16px; font-weight: 700; color: #111;">${content.aboutTitle}</p>
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #111;">${description}</p>

      <!-- WHAT YOU LEARN -->
      <p style="margin: 25px 0 15px 0; font-size: 16px; font-weight: 700; color: #111;">${content.learnTitle}</p>
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #111;">${learningPoints}</p>

      <!-- SCHEDULE -->
      <p style="margin: 25px 0 15px 0; font-size: 16px; font-weight: 700; color: #111;">${content.scheduleTitle}</p>
      <div style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #111; white-space: pre-line;">${schedule}</div>

      <!-- VIDEO SECTION -->
      <p style="margin: 25px 0 15px 0; font-size: 16px; font-weight: 700; color: #111;">${content.videoTitle}</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
        <tr>
          <td width="120" style="vertical-align: top;">
            <a href="${videoUrl}" target="_blank" style="text-decoration: none;">
              <img src="${videoThumbnail}" width="120" height="213" style="border-radius: 8px; border: 1px solid #eee; display: block; object-fit: cover;" />
            </a>
          </td>
          <td style="padding-left: 20px; vertical-align: top;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #111;">${aftermovieText}</p>
          </td>
        </tr>
      </table>

      <!-- INSTRUCTOR -->
      <p style="margin: 25px 0 15px 0; font-size: 16px; font-weight: 700; color: #111;">${content.instructorBioTitle}</p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
        <tr>
          <td style="vertical-align: top;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #111;">${instructorName} is een bedreven voice-over met jarenlange ervaring. Je herkent zijn stem van TV-spots en hulplijnen van grote merken.</p>
          </td>
          <td width="120" style="vertical-align: top; padding-left: 20px;">
            <img src="${instructorImage}" width="120" height="213" style="border-radius: 8px; border: 1px solid #eee; display: block; object-fit: cover;" />
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align: center; padding: 32px 0; border-top: 1px solid #eee;">
        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #111;">${content.ctaTitle}</p>
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">${content.ctaText}</p>
        <a href="https://${host}/account/orders" style="display: inline-block; background: #000000; color: #ffffff; text-align: center; padding: 15px 30px; border-radius: 10px; font-size: 16px; font-weight: 600; text-transform: uppercase; text-decoration: none;">${content.button}</a>
      </div>

      <!-- SIGNATURE -->
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #111;">
          ${content.footer}<br />
          <a href="https://${host}/studio/" style="color: #111; font-weight: bold; text-decoration: underline;">www.${host}/studio/</a>
        </p>
    </div>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: workshopName,
    journey: 'studio',
    host,
    headerImage: headerImage || `https://${host}/assets/studio/common/branding/VSTUDIO.webp`,
    optOutUrl
  });
}
