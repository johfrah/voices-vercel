import { describe, expect, it } from 'vitest';
import {
  TELEPHONY_JOURNEY_HREF,
  resolveJourneyCtaConfig,
} from './journey-cta';

describe('journey CTA routing', () => {
  it('keeps telephony CTA routed to the agency entry flow', () => {
    const config = resolveJourneyCtaConfig('telephony', 'AGENCY');

    expect(config.key).toBe('telephony');
    expect(config.href).toBe('/agency/');
    expect(TELEPHONY_JOURNEY_HREF).toBe('/agency/');
  });

  it('uses market override CTA for studio and academy worlds', () => {
    expect(resolveJourneyCtaConfig('commercial', 'STUDIO')).toMatchObject({
      key: 'studio',
      href: '/studio',
    });

    expect(resolveJourneyCtaConfig('video', 'ACADEMY')).toMatchObject({
      key: 'academy',
      href: '/academy',
    });
  });

  it('falls back to general CTA for unsupported journeys', () => {
    const config = resolveJourneyCtaConfig('unknown-journey', 'AGENCY');

    expect(config.key).toBe('general');
    expect(config.href).toBe('/tarieven');
  });
});
