import { NextResponse } from 'next/server';

/**
 *  NUCLEAR VIES VALIDATION (2026)
 * 
 * Gebruikt de VatComply API als betrouwbare proxy voor de EU VIES service.
 * Dit omzeilt de fragiele SOAP connectie en firewall issues van de EU servers.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vatNumber = searchParams.get('vat');

  if (!vatNumber) {
    return NextResponse.json({ error: 'VAT number required' }, { status: 400 });
  }

  // Schoon het nummer op
  const cleanVat = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

  if (cleanVat.length < 5) {
    return NextResponse.json({ valid: false, error: 'Invalid format' });
  }

  try {
    console.log(`[VIES] Validating VAT: ${cleanVat} via VatComply`);
    
    const response = await fetch(`https://api.vatcomply.com/vat?vat_number=${cleanVat}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, 
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`VatComply returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      vatNumber: cleanVat,
      valid: data.valid,
      companyName: data.name && data.name !== '---' ? data.name : null,
      address: data.address && data.address !== '---' ? data.address : null,
      countryCode: data.country_code,
      timestamp: new Date().toISOString(),
      source: 'VatComply (VIES Proxy)'
    });

  } catch (error) {
    console.error(' VIES Validation Error:', error);
    
    //  GRACEFUL FAIL: Als de service down is, blokkeren we de gebruiker niet
    // maar we geven wel aan dat we niet konden valideren.
    return NextResponse.json({ 
      error: 'SERVICE_UNAVAILABLE',
      details: error instanceof Error ? error.message : 'Unknown error',
      vatNumber: cleanVat,
      valid: null, // null betekent: we weten het niet
      message: 'BTW-verificatie tijdelijk niet beschikbaar. Je kunt handmatig verder gaan.'
    });
  }
}
