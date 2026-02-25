import { VOICES_CONFIG } from '@/lib/system/db';

/**
 *  MOLLIE NUCLEAR SERVICE (2026)
 * 
 * Deze service vervangt de PHP voices_mollie_request logica.
 * Het handelt alle betalingen af via de Mollie API.
 */

export interface MollieOrderRequest {
  amount: {
    currency: string;
    value: string;
  };
  orderNumber: string;
  lines: Array<{
    type?: string;
    name: string;
    quantity: number;
    unitPrice: {
      currency: string;
      value: string;
    };
    totalAmount: {
      currency: string;
      value: string;
    };
    vatRate: string;
    vatAmount: {
      currency: string;
      value: string;
    };
    metadata?: any;
  }>;
  billingAddress: {
    streetAndNumber: string;
    postalCode: string;
    city: string;
    country: string;
    givenName: string;
    familyName: string;
    email: string;
  };
  redirectUrl: string;
  webhookUrl: string;
  locale?: string;
  method?: string;
  metadata: Record<string, any>;
}

export class MollieService {
  // 🛡️ CHRIS-PROTOCOL: Gebruik UITSLUITEND de API key uit .env
  private static API_KEY = process.env.MOLLIE_API_KEY || '';
  private static BASE_URL = 'https://api.mollie.com/v2';

  /**
   * 🛡️ CHRIS-PROTOCOL: Validate API key at startup (v2.14.294)
   */
  public static validateApiKey(): void {
    if (!this.API_KEY) {
      console.error('[Mollie Service] ❌ FATAL: MOLLIE_API_KEY is missing in environment variables');
      throw new Error('Mollie API Key is required but not configured');
    }
    if (!this.API_KEY.startsWith('test_') && !this.API_KEY.startsWith('live_')) {
      console.warn('[Mollie Service] ⚠️ WARNING: MOLLIE_API_KEY format is invalid (should start with test_ or live_)');
    }
    console.log('[Mollie Service] ✅ API Key validated:', this.API_KEY.substring(0, 10) + '...');
  }

  /**
   * Voer een request uit naar de Mollie API
   */
  public static async request(method: string, endpoint: string, payload?: any) {
    if (!this.API_KEY) {
      console.error('[Mollie Service] ❌ FATAL: Attempted to make API request without valid API key');
      throw new Error('Mollie API Key missing');
    }

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
      console.error('[Mollie API Error]:', data);
      throw new Error(data.detail || data.title || 'Mollie API Error');
    }

    return data;
  }

  /**
   * Maak een nieuwe betaling aan (Legacy support)
   */
  static async createPayment(data: any) {
    try {
      return await this.request('POST', '/payments', data);
    } catch (error) {
      console.error('[Mollie Service]: Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe Order aan (Aanbevolen voor 2026)
   * Dit vervangt createPayment voor betere rapportage en Klarna support.
   */
  static async createOrder(data: MollieOrderRequest) {
    try {
      return await this.request('POST', '/orders', data);
    } catch (error) {
      console.error('[Mollie Service]: Order creation failed:', error);
      throw error;
    }
  }

  /**
   * Voer een (gedeeltelijke) terugbetaling uit
   */
  static async refund(paymentId: string, amount?: string) {
    const payload = amount ? { amount: { currency: 'EUR', value: amount } } : {};
    return this.request('POST', `/payments/${paymentId}/refunds`, payload);
  }

  /**
   * Maak een Customer aan voor subscriptions
   */
  static async createCustomer(name: string, email: string) {
    return this.request('POST', '/customers', { name, email });
  }

  /**
   * Haal beschikbare betaalmethodes op
   */
  static async getMethods(amount: string = '10.00', currency: string = 'EUR') {
    return this.request('GET', `/methods?amount[value]=${amount}&amount[currency]=${currency}`);
  }

  /**
   * Haal de status van een betaling op
   */
  static async getPayment(paymentId: string) {
    return this.request('GET', `/payments/${paymentId}`);
  }

  /**
   * Haal de status van een order op
   */
  static async getOrder(orderId: string) {
    return this.request('GET', `/orders/${orderId}`);
  }
}
