import { NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';

/**
 * ⚡ NUCLEAR VIES VALIDATION (2026)
 * 
 * Directe SOAP connectie met de Europese Commissie (VIES).
 * Geen simulatie, pure data-integriteit voor het platform.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vatNumber = searchParams.get('vat');

  if (!vatNumber) {
    return NextResponse.json({ error: 'VAT number required' }, { status: 400 });
  }

  // Schoon het nummer op: verwijder spaties, punten, etc.
  const cleanVat = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const countryCode = cleanVat.substring(0, 2);
  const vatOnly = cleanVat.substring(2);

  if (cleanVat.length < 5) {
    return NextResponse.json({ valid: false, error: 'Invalid format' });
  }

  try {
    // VIES SOAP Request Body
    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://ec.europa.eu/taxation/vies/v1/specs">
        <soapenv:Header/>
        <soapenv:Body>
          <v1:checkVat>
            <v1:countryCode>${countryCode}</v1:countryCode>
            <v1:vatNumber>${vatOnly}</v1:vatNumber>
          </v1:checkVat>
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const response = await fetch('http://ec.europa.eu/taxation/vies/services/checkVatService', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': '',
      },
      body: soapBody,
    });

    if (!response.ok) {
      throw new Error('VIES Service unreachable');
    }

    const xmlData = await response.text();
    const result = await parseStringPromise(xmlData, { explicitArray: false });
    
    // Navigeer door de SOAP-envelope naar de data
    const body = result['soap:Envelope']['soap:Body']['checkVatResponse'];
    
    const isValid = body.valid === 'true';
    const companyName = body.name !== '---' ? body.name : null;
    const address = body.address !== '---' ? body.address : null;

    return NextResponse.json({
      vatNumber: cleanVat,
      valid: isValid,
      companyName: companyName,
      address: address,
      countryCode: countryCode,
      timestamp: new Date().toISOString(),
      source: 'VIES Official'
    });

  } catch (error) {
    console.error('❌ VIES Validation Error:', error);
    return NextResponse.json({ 
      error: 'VIES validation service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
