import { NextRequest, NextResponse } from 'next/server';
import { MollieService } from '@/lib/payments/mollie';
import { db, paymentMethods, media } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';

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
  // 🛡️ CHRIS-PROTOCOL: Fetch local payment methods from DB (Source of Truth)
  let localMethods: any[] = [];
  try {
    const dbMethods = await db.select({
      id: paymentMethods.code,
      description: paymentMethods.label,
      isOnline: paymentMethods.isOnline,
      imagePath: media.filePath
    })
    .from(paymentMethods)
    .leftJoin(media, eq(paymentMethods.mediaId, media.id));
    
    localMethods = dbMethods.map(m => ({
      id: m.id,
      description: m.description,
      isOnline: m.isOnline,
      image: m.imagePath ? { size2x: `/assets/${m.imagePath}` } : undefined
    }));
  } catch (err) {
    console.warn('[API Checkout Config] DB methods fetch failed:', err);
  }

  // Vroeg fallback: geen Mollie key = geen API-call (voorkomt 500 bij build/runtime)
  if (!process.env.MOLLIE_API_KEY) {
    return NextResponse.json({
      success: true,
      paymentMethods: localMethods.length > 0 ? localMethods : FALLBACK_METHODS,
      taxRate: 0.21,
      currency: 'EUR',
      _source: localMethods.length > 0 ? 'database' : 'fallback',
    });
  }

  try {
    const mollieMethods = await MollieService.getMethods();
    const apiMethods = mollieMethods._embedded?.methods || [];

    // 🛡️ CHRIS-PROTOCOL: Merge local methods with Mollie methods
    // Local methods (like manual_invoice) take precedence or are added to the list.
    const mergedMethods = [...apiMethods];
    localMethods.forEach(lm => {
      if (!mergedMethods.find(am => am.id === lm.id)) {
        mergedMethods.push(lm);
      }
    });

    return NextResponse.json({
      success: true,
      paymentMethods: mergedMethods,
      taxRate: 0.21,
      currency: 'EUR',
      _nuclear: true,
      _source: 'mollie-api-merged'
    });
  } catch (error) {
    console.warn('[API Checkout Config]: Mollie unavailable, using local/fallback:', (error as Error).message);
    return NextResponse.json({
      success: true,
      paymentMethods: localMethods.length > 0 ? localMethods : FALLBACK_METHODS,
      taxRate: 0.21,
      currency: 'EUR',
      _source: localMethods.length > 0 ? 'database' : 'fallback',
    });
  }
}
