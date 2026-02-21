import { NextRequest, NextResponse } from 'next/server';
import { MollieService } from '@/lib/payments/mollie';

/**
 *  API: CHECKOUT CONFIG (2026)
 * 
 * Doel: Haalt alle configuratie op voor de checkout pagina (betaalmethodes, tax rates, etc.)
 * Vervangt de WordPress /wp-json/voices/v2/checkout/config endpoint.
 */

const FALLBACK_METHODS = [
  { id: 'bancontact', description: 'Bancontact', image: { size2x: 'https://www.mollie.com/external/icons/payment-methods/bancontact%402x.png' } },
  { id: 'ideal', description: 'iDEAL', image: { size2x: 'https://www.mollie.com/external/icons/payment-methods/ideal%402x.png' } },
];

export async function GET(request: NextRequest) {
  // Vroeg fallback: geen Mollie key = geen API-call (voorkomt 500 bij build/runtime)
  if (!process.env.MOLLIE_API_KEY) {
    return NextResponse.json({
      success: true,
      paymentMethods: FALLBACK_METHODS,
      taxRate: 0.21,
      currency: 'EUR',
      _source: 'fallback',
    });
  }

  try {
    const mollieMethods = await MollieService.getMethods();

    return NextResponse.json({
      success: true,
      paymentMethods: mollieMethods._embedded?.methods || [],
      taxRate: 0.21,
      currency: 'EUR',
      _nuclear: true,
      _source: 'mollie-api'
    });
  } catch (error) {
    console.warn('[API Checkout Config]: Mollie unavailable, using fallback:', (error as Error).message);
    return NextResponse.json({
      success: true,
      paymentMethods: FALLBACK_METHODS,
      taxRate: 0.21,
      currency: 'EUR',
      _source: 'fallback',
    });
  }
}
