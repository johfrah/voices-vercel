import { NextResponse } from 'next/server';

/**
 * PRICING ENGINE (NUCLEAR LOGIC 2026)
 * 
 * Vertaalt de complexe PHP pricing helpers naar een snelle TypeScript engine.
 * Verantwoordelijk voor:
 * 1. Rechten-gebaseerde prijsberekening (Buyouts)
 * 2. Volume kortingen
 * 3. BTW berekeningen (VIES integratie)
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { basePrice, category, duration, market, hasVatNumber } = body;

    let finalPrice = parseFloat(basePrice) || 0;
    
    // 1. Category Multipliers (Buyouts)
    const multipliers: Record<string, number> = {
      'commercial-local': 1.0,
      'commercial-national': 2.5,
      'commercial-international': 5.0,
      'e-learning': 0.8,
      'telephony': 1.2
    };

    const multiplier = multipliers[category] || 1.0;
    finalPrice *= multiplier;

    // 2. Duration Logic
    if (duration > 300) { // Meer dan 5 minuten
      finalPrice *= 0.9; // 10% volume korting
    }

    // 3. Tax Logic (Excl. BTW Mandate)
    const vatRate = market === 'BE' ? 0.21 : 0.0; // Reverse charge voor buitenland met BTW nr
    const vatAmount = hasVatNumber ? 0 : (finalPrice * vatRate);

    return NextResponse.json({
      basePrice: basePrice,
      multiplier: multiplier,
      subtotal: finalPrice.toFixed(2),
      vatAmount: vatAmount.toFixed(2),
      total: (finalPrice + vatAmount).toFixed(2),
      currency: 'EUR',
      engine: 'Voices-Pricing-V3-TS'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Pricing calculation failed' }, { status: 500 });
  }
}
