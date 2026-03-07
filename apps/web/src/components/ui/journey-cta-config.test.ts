import { describe, expect, it } from 'vitest';
import { resolveJourneyCtaConfig, TELEPHONY_CTA_HREF } from './journey-cta-config';

describe('journey cta config resolver', () => {
  it('keeps telephony CTA routed to agency flow', () => {
    const config = resolveJourneyCtaConfig('telephony', 'AGENCY');

    expect(config.key).toBe('telephony');
    expect(config.href).toBe(TELEPHONY_CTA_HREF);
    expect(config.href).toBe('/agency/');
  });

  it('forces studio world CTA when market is STUDIO', () => {
    const config = resolveJourneyCtaConfig('commercial', 'STUDIO');

    expect(config.key).toBe('studio');
    expect(config.href).toBe('/studio');
  });

  it('forces academy world CTA when market is ACADEMY', () => {
    const config = resolveJourneyCtaConfig('video', 'ACADEMY');

    expect(config.key).toBe('academy');
    expect(config.href).toBe('/academy');
  });

  it('keeps non-overridden journeys stable', () => {
    const videoConfig = resolveJourneyCtaConfig('video', 'AGENCY');
    const commercialConfig = resolveJourneyCtaConfig('commercial', 'AGENCY');
    const generalConfig = resolveJourneyCtaConfig('general', undefined);

    expect(videoConfig.href).toBe('/agency?category=video');
    expect(commercialConfig.href).toBe('/tarieven?journey=commercial');
    expect(generalConfig.href).toBe('/tarieven');
  });
});
