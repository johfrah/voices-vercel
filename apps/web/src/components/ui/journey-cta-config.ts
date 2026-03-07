export type JourneyCtaJourney = 'telephony' | 'video' | 'commercial' | 'general';

export interface JourneyCtaConfig {
  title: string;
  text: string;
  cta: string;
  href: string;
  key: string;
  color: string;
}

export const TELEPHONY_CTA_HREF = '/agency/';

const JOURNEY_CTA_CONFIGS: Record<string, JourneyCtaConfig> = {
  telephony: {
    title: 'Klaar voor een warm onthaal?',
    text: 'Start direct met onze IVR-configurator of bereken je prijs voor een complete telefonieset.',
    cta: 'Start configuratie',
    href: TELEPHONY_CTA_HREF,
    key: 'telephony',
    color: 'bg-blue-600',
  },
  video: {
    title: 'Breng je beelden tot leven',
    text: 'Ontdek onze narratieve stemmen en vraag direct een offerte aan voor je e-learning of bedrijfsfilm.',
    cta: 'Bekijk stemmen',
    href: '/agency?category=video',
    key: 'video',
    color: 'bg-purple-600',
  },
  commercial: {
    title: 'Maak impact met je campagne',
    text: 'Boek een top-stem voor je radiospot of tv-commercial inclusief live-regie en buy-out.',
    cta: 'Bereken campagne-prijs',
    href: '/tarieven?journey=commercial',
    key: 'commercial',
    color: 'bg-primary',
  },
  general: {
    title: 'De perfecte stem gevonden?',
    text: 'Bereken direct je tarief of neem contact op voor advies op maat van onze experts.',
    cta: 'Bereken tarief',
    href: '/tarieven',
    key: 'general',
    color: 'bg-primary',
  },
  studio: {
    title: 'Klaar om je stem te laten horen?',
    text: 'Ontdek onze workshops of start direct met de online Academy en ontwikkel je ambacht.',
    cta: 'Bekijk aanbod',
    href: '/studio',
    key: 'studio',
    color: 'bg-primary',
  },
  academy: {
    title: 'Klaar om het ambacht te leren?',
    text: 'Ontdek de online Academy en leer stap voor stap hoe je een luisteraar echt bereikt.',
    cta: 'Bekijk het traject',
    href: '/academy',
    key: 'academy',
    color: 'bg-[#6366f1]',
  },
};

export function resolveJourneyCtaConfig(
  journey: JourneyCtaJourney,
  marketCode?: string | null
): JourneyCtaConfig {
  if (marketCode === 'STUDIO') {
    return JOURNEY_CTA_CONFIGS.studio;
  }

  if (marketCode === 'ACADEMY') {
    return JOURNEY_CTA_CONFIGS.academy;
  }

  return JOURNEY_CTA_CONFIGS[journey] ?? JOURNEY_CTA_CONFIGS.general;
}
