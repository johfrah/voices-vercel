/**
 * ⚡ PRICING ENGINE (2026)
 * 
 * Centraliseert alle prijsberekeningen voor Voices.
 * Doel: Single Source of Truth voor zowel frontend (100ms feedback) als backend (Mollie/Yuki).
 * 
 * @author Kelly (Transaction Guardian)
 */

export type UsageType = 'unpaid' | 'telefonie' | 'subscription' | 'commercial' | 'non-commercial';
export type PlanType = 'basic' | 'pro' | 'studio';

export interface PricingConfig {
  basePrice: number;
  wordRate: number;
  vatRate: number;
  musicSurcharge: number;
  aiDiscount?: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  basePrice: 149,
  wordRate: 0.25,
  vatRate: 0.21,
  musicSurcharge: 59,
};

export interface PricingInput {
  usage: UsageType;
  words?: number;
  prompts?: number;
  music?: {
    asBackground?: boolean;
    asHoldMusic?: boolean;
  };
  plan?: PlanType;
  isVatExempt?: boolean;
}

export interface PricingResult {
  base: number;
  wordSurcharge: number;
  musicSurcharge: number;
  subtotal: number;
  vat: number;
  total: number;
  vatRate: number;
}

export class PricingEngine {
  /**
   * Berekent de volledige prijsopbouw op basis van input.
   */
  static calculate(input: PricingInput, config: PricingConfig = DEFAULT_PRICING_CONFIG): PricingResult {
    let base = config.basePrice;
    let wordSurcharge = 0;
    let musicSurcharge = 0;

    // 1. Base Price Logic
    if (input.usage === 'subscription') {
      if (input.plan === 'pro') base = 49;
      else if (input.plan === 'studio') base = 99;
      else base = 29;
    } else if (input.usage === 'telefonie') {
      base = 129; // Speciaal tarief voor telefonie
    }

    // 2. Word/Prompt Surcharge
    if (input.words && input.words > 100) {
      wordSurcharge = (input.words - 100) * config.wordRate;
    } else if (input.prompts && input.prompts > 5) {
      wordSurcharge = (input.prompts - 5) * 10; // €10 per extra prompt
    }

    // 3. Music Surcharge
    if (input.music?.asBackground || input.music?.asHoldMusic) {
      musicSurcharge = config.musicSurcharge;
    }

    const subtotal = base + wordSurcharge + musicSurcharge;
    const currentVatRate = input.isVatExempt ? 0 : config.vatRate;
    const vat = subtotal * currentVatRate;
    const total = subtotal + vat;

    return {
      base,
      wordSurcharge,
      musicSurcharge,
      subtotal,
      vat,
      total,
      vatRate: currentVatRate
    };
  }

  /**
   * Formatteert een bedrag naar EUR string.
   */
  static format(amount: number): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
