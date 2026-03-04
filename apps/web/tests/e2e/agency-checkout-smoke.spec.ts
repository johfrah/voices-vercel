import { expect, test } from '@playwright/test';

const basePayload = {
  pricing: { total: 120 },
  email: 'smoke@voices.be',
  first_name: 'Smoke',
  last_name: 'Tester',
  postal_code: '1000',
  city: 'Brussel',
  country: 'BE',
  usage: 'unpaid',
  payment_method: 'bancontact',
};

test.describe('Agency checkout submit smoke', () => {
  test('rejects empty cart with clear response', async ({ request }) => {
    const response = await request.post('/api/checkout/submit', {
      data: {
        ...basePayload,
        items: [],
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Leeg mandje');
  });

  test('rejects voice-over item without actor_id', async ({ request }) => {
    const response = await request.post('/api/checkout/submit', {
      data: {
        ...basePayload,
        items: [
          {
            id: 'voice-smoke-1',
            type: 'voice_over',
            usage: 'commercial',
            briefing: 'Dit is een geldige tekst voor de checkout smoke test.',
            media: ['online'],
            country: 'BE',
            spots: 1,
            years: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.error).toContain('ongeldig');
    expect(Array.isArray(body.details)).toBeTruthy();
    expect(body.details[0].reason).toContain('actor_id');
  });
});
