import { describe, it, expect } from 'vitest';
import { SlimmeKassa, DEFAULT_KASSA_CONFIG } from './pricing-engine';

describe('SlimmeKassa (Pricing Engine)', () => {
  const mockActor = {
    id: 'test-actor',
    name: 'Test Actor',
    price_bsf: 199,
    price_online: 199,
    rates: {
      GLOBAL: {
        bsf: 199,
        online: 199,
        ivr: 89,
        unpaid: 249
      },
      BE: {
        ivr: 89
      }
    }
  };

  describe('Telephony (IVR)', () => {
    it('should calculate base price for telephony within word threshold', () => {
      const result = SlimmeKassa.calculate({
        usage: 'telefonie',
        words: 20,
        country: 'BE',
        actorRates: mockActor
      });

      expect(result.base).toBe(89);
      expect(result.wordSurcharge).toBe(0);
      expect(result.total).toBe(107.69); // 89 * 1.21
    });

    it('should add surcharge for extra words in telephony', () => {
      const result = SlimmeKassa.calculate({
        usage: 'telefonie',
        words: 100, // 75 extra words
        country: 'BE',
        actorRates: mockActor
      });

      // Threshold is 25. Extra words = 75.
      // Word price is €1.00. Surcharge = €75.
      // Setup fee = €19.95.
      // Processing fee = 10% of (89 + 75) = €16.40.
      // Total surcharge = 75 + 19.95 + 16.40 = 111.35.
      expect(result.base).toBe(89);
      expect(result.wordSurcharge).toBe(111.35);
      expect(result.subtotal).toBe(200.35);
    });

    it('should apply music surcharge for telephony', () => {
      const result = SlimmeKassa.calculate({
        usage: 'telefonie',
        words: 20,
        music: { asBackground: true },
        country: 'BE',
        actorRates: mockActor
      });

      expect(result.musicSurcharge).toBe(59);
      expect(result.subtotal).toBe(89 + 59);
    });
  });

  describe('Commercial (Buyouts)', () => {
    it('should calculate commercial price for online usage', () => {
      const result = SlimmeKassa.calculate({
        usage: 'commercial',
        mediaTypes: ['online'],
        country: 'BE',
        actorRates: mockActor
      });

      // BSF = 199. Online = 199.
      // Buyout = Online - BSF = 0.
      // Effective buyout min = €100.
      // Total = BSF (199) + Buyout (100) = 299.
      expect(result.base).toBe(199);
      expect(result.mediaSurcharge).toBe(100);
      expect(result.subtotal).toBe(299);
    });

    it('should multiply buyout for multiple spots', () => {
      const result = SlimmeKassa.calculate({
        usage: 'commercial',
        mediaTypes: ['online'],
        spots: { online: 2 },
        country: 'BE',
        actorRates: mockActor
      });

      // Buyout = 100 * 2 = 200.
      expect(result.mediaSurcharge).toBe(200);
      expect(result.subtotal).toBe(199 + 200);
    });
  });

  describe('VAT Logic', () => {
    it('should apply 0% VAT if exempt', () => {
      const result = SlimmeKassa.calculate({
        usage: 'telefonie',
        words: 20,
        isVatExempt: true,
        actorRates: mockActor
      });

      expect(result.vat).toBe(0);
      expect(result.total).toBe(result.subtotal);
    });
  });
});
