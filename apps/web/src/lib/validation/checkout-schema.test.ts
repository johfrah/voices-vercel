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
      billing_po: 'PO-2026-001',
      financial_email: 'finance@voices.be',
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
    expect(parsed.billing_po).toBe('PO-2026-001');
    expect(parsed.financial_email).toBe('finance@voices.be');
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
      purchase_order: 'PO-ALIAS-7',
      billing_email_alt: 'boekhouding@voices.be',
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
    expect(parsed.purchase_order).toBe('PO-ALIAS-7');
    expect(parsed.billing_email_alt).toBe('boekhouding@voices.be');
    expect(parsed.payment_method).toBe('ideal');
  });

  it('accepts a top-level journey field for world-aware checkout routing', () => {
    const payload = {
      pricing: { total: 149.5 },
      items: [
        {
          id: 'workshop-42',
          type: 'workshop_edition',
          workshop_id: 42,
          edition_id: 77,
          pricing: { total: 149.5, subtotal: 123.55, tax: 25.95 },
        },
      ],
      email: 'studio@voices.be',
      first_name: 'Studio',
      last_name: 'Tester',
      postal_code: '2000',
      city: 'Antwerpen',
      country: 'BE',
      usage: 'subscription',
      journey: 'studio',
      payment_method: 'bancontact',
    };

    const parsed = CheckoutPayloadSchema.parse(payload);
    expect(parsed.journey).toBe('studio');
  });
});
