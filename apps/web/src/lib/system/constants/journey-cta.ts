export const JOURNEY_CTA_CONFIGS = {
  telephony: {
    title: 'Klaar voor een warm onthaal?',
    text: 'Start direct met onze IVR-configurator of bereken je prijs voor een complete telefonieset.',
    cta: 'Start configuratie',
    href: '/agency/',
    color: 'bg-blue-600',
    key: 'telephony',
  },
  video: {
    title: 'Breng je beelden tot leven',
    text: 'Ontdek onze narratieve stemmen en vraag direct een offerte aan voor je e-learning of bedrijfsfilm.',
    cta: 'Bekijk stemmen',
    href: '/agency?category=video',
    color: 'bg-purple-600',
    key: 'video',
  },
  commercial: {
    title: 'Maak impact met je campagne',
    text: 'Boek een top-stem voor je radiospot of tv-commercial inclusief live-regie en buy-out.',
    cta: 'Bereken campagne-prijs',
    href: '/tarieven?journey=commercial',
    color: 'bg-primary',
    key: 'commercial',
  },
  general: {
    title: 'De perfecte stem gevonden?',
    text: 'Bereken direct je tarief of neem contact op voor advies op maat van onze experts.',
    cta: 'Bereken tarief',
    href: '/tarieven',
    color: 'bg-primary',
    key: 'general',
  },
  studio: {
    title: 'Klaar om je stem te laten horen?',
    text: 'Ontdek onze workshops of start direct met de online Academy en ontwikkel je ambacht.',
    cta: 'Bekijk aanbod',
    href: '/studio',
    color: 'bg-primary',
    key: 'studio',
  },
  academy: {
    title: 'Klaar om het ambacht te leren?',
    text: 'Ontdek de online Academy en leer stap voor stap hoe je een luisteraar echt bereikt.',
    cta: 'Bekijk het traject',
    href: '/academy',
    color: 'bg-[#6366f1]',
    key: 'academy',
  },
} as const;

export type JourneyCtaKey = keyof typeof JOURNEY_CTA_CONFIGS;
export type JourneyCtaConfig = (typeof JOURNEY_CTA_CONFIGS)[JourneyCtaKey];
export type JourneyCtaJourney = 'telephony' | 'video' | 'commercial' | 'general';

export const TELEPHONY_JOURNEY_HREF = JOURNEY_CTA_CONFIGS.telephony.href;

export const resolveJourneyCtaConfig = (
  journey: JourneyCtaJourney | string | null | undefined,
  marketCode?: string | null
): JourneyCtaConfig => {
  if (marketCode === 'STUDIO') return JOURNEY_CTA_CONFIGS.studio;
  if (marketCode === 'ACADEMY') return JOURNEY_CTA_CONFIGS.academy;

  return JOURNEY_CTA_CONFIGS[journey as JourneyCtaJourney] || JOURNEY_CTA_CONFIGS.general;
};
