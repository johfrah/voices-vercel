import { NextResponse } from 'next/server';
import { vies-service } from '@/lib/services/vies-service';

/**
 *  NUCLEAR VIES VALIDATION (2026)
 * 
 * Gebruikt de vies-service voor betrouwbare validatie via de EU VIES API.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vatNumber = searchParams.get('vat');

  if (!vatNumber) {
    return NextResponse.json({ error: 'VAT number required' }, { status: 400 });
  }

  try {
    const vies = vies-service.getInstance();
    const data = await vies.validateVat(vatNumber);

    if (!data) {
      throw new Error('VIES validation failed');
    }

    return NextResponse.json({
      vatNumber: data.vatNumber,
      valid: data.isValid,
      companyName: data.name,
      address: data.address,
      countryCode: data.countryCode,
      timestamp: new Date().toISOString(),
      source: 'EU VIES API'
    });

  } catch (error) {
    console.error(' VIES Validation Error:', error);
    
    return NextResponse.json({ 
      error: 'SERVICE_UNAVAILABLE',
      details: error instanceof Error ? error.message : 'Unknown error',
      valid: null,
      message: 'BTW-verificatie tijdelijk niet beschikbaar. Je kunt handmatig verder gaan.'
    });
  }
}
