import { describe, expect, it } from 'vitest';
import { CheckoutPayloadSchema } from './checkout-schema';

describe('CheckoutPayloadSchema', () => {
  it('preserves commercial item pricing fields for server-side recalculation', () => {
    const payload = {
      pricing: { total: 560.5 },
      items: [
        {
          id: 'voice-1',
          type: 'voice_over',
          usage: 'commercial',
          journey: 'agency',
          actor: { id: 42, display_name: 'Test Stem' },
          briefing: 'Dit is een testscript met genoeg woorden.',
          media: ['tv_national', 'online'],
          country: ['BE', 'NL'],
          spots: { tv_national: 3, online: 2 },
          years: { tv_national: 1, online: 2 },
          liveSession: true,
          music: {
            trackId: 'corporate-rise',
            asBackground: true,
            asHoldMusic: false,
          },
          pricing: {
            total: 560.5,
            subtotal: 463.22,
            tax: 97.28,
            base: 199,
            mediaSurcharge: 250,
            wordSurcharge: 14.22,
            musicSurcharge: 0,
          },
        },
      ],
      email: 'qa@voices.be',
      first_name: 'QA',
      last_name: 'Tester',
      postal_code: '9000',
      city: 'Gent',
      country: 'BE',
      language: 'nl-BE',
      usage: 'commercial',
      payment_method: 'bancontact',
    };

    const parsed = CheckoutPayloadSchema.parse(payload);
    const [item] = parsed.items;

    expect(item.media).toEqual(['tv_national', 'online']);
    expect(item.country).toEqual(['BE', 'NL']);
    expect(item.spots).toEqual({ tv_national: 3, online: 2 });
    expect(item.years).toEqual({ tv_national: 1, online: 2 });
    expect(item.liveSession).toBe(true);
    expect(item.music).toEqual({
      trackId: 'corporate-rise',
      asBackground: true,
      asHoldMusic: false,
    });
  });

  it('coerces numeric factors and accepts snake_case customer payload', () => {
    const payload = {
      pricing: { total: 120 },
      items: [
        {
          id: 'voice-2',
          type: 'voice_over',
          actor: { id: '7' },
          usage: 'commercial',
          media: 'online',
          country: 'BE',
          spots: '2',
          years: '3',
          pricing: { total: 120, subtotal: 99.17, tax: 20.83 },
        },
      ],
      email: 'demo@voices.be',
      first_name: 'Demo',
      last_name: 'Gebruiker',
      postal_code: '1000',
      city: 'Brussel',
      country: 'BE',
      usage: 'commercial',
      payment_method: 'ideal',
    };

    const parsed = CheckoutPayloadSchema.parse(payload);
    const [item] = parsed.items;

    expect(item.actor?.id).toBe(7);
    expect(item.spots).toBe(2);
    expect(item.years).toBe(3);
    expect(parsed.first_name).toBe('Demo');
    expect(parsed.payment_method).toBe('ideal');
  });
});
