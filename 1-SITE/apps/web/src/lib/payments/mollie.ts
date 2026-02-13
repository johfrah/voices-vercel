import { VOICES_CONFIG } from '@config/config';

/**
 * ⚡ MOLLIE NUCLEAR SERVICE (2026)
 * 
 * Deze service vervangt de PHP voices_mollie_request logica.
 * Het handelt alle betalingen af via de Mollie API.
 */

export interface MolliePaymentRequest {
  amount: {
    currency: string;
    value: string;
  };
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: Record<string, any>;
}

export class MollieService {
  private static API_KEY = process.env.MOLLIE_API_KEY || '';
  private static BASE_URL = 'https://api.mollie.com/v2';

  /**
   * Voer een request uit naar de Mollie API
   */
  private static async request(method: string, endpoint: string, payload?: any) {
    if (!this.API_KEY) throw new Error('Mollie API Key missing');

    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Mollie API Error');
    }

    return data;
  }

  /**
   * Haal beschikbare betaalmethodes op
   */
  static async getMethods(amount: string = '10.00', currency: string = 'EUR') {
    return this.request('GET', `/methods?amount[value]=${amount}&amount[currency]=${currency}`);
  }

  /**
   * Maak een nieuwe betaling aan
   */
  static async createPayment(data: MolliePaymentRequest) {
    try {
      return await this.request('POST', '/payments', data);
    } catch (error) {
      console.error('[Mollie Service]: Payment creation failed, checking for banktransfer fallback...', error);
      // Cody-Felix Synergy: If Mollie is down, we could return a specific flag to trigger banktransfer
      throw error;
    }
  }

  /**
   * Haal de status van een betaling op
   */
  static async getPayment(paymentId: string) {
    return this.request('GET', `/payments/${paymentId}`);
  }
}
