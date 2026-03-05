import { MollieService } from '@/lib/payments/mollie';
import { db, orders } from '@/lib/system/voices-config';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';
import { NextResponse } from 'next/server';

/**
 *  ARTIST DONATION API (NUCLEAR 2026)
 * 
 * Doel: Directe donaties aan artiesten via Mollie.
 * Bypasses de standaard winkelwagen voor een snelle 'Support' flow.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artistId, amount, donorName, donorEmail, message, returnUrl } = body;
    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'www.voices.be');
    const market = MarketManager.getCurrentMarket(host);
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const normalizedReturnPath =
      typeof returnUrl === 'string' && returnUrl.trim().startsWith('/')
        ? returnUrl.trim()
        : '/artist/youssef';

    if (!artistId || !amount || amount < 1) {
      return NextResponse.json({ error: 'Invalid donation data' }, { status: 400 });
    }

    // 1. Registreer de donatie-intentie in de database (als een speciale order)
    const [order] = await db.insert(orders).values({
      user_id: null, // Donateurs hoeven niet ingelogd te zijn
      total: amount.toString(),
      status: 'pending',
      journey: 'artist_donation',
      market: market.market_code,
      iapContext: {
        artistId,
        donorName,
        donorEmail,
        message,
        type: 'donation'
      },
      createdAt: new Date()
    }).returning();

    // 2. Initialiseer Mollie betaling
    const payment = await MollieService.request('POST', '/payments', {
      amount: {
        currency: 'EUR',
        value: parseFloat(amount).toFixed(2)
      },
      description: `Donatie voor artiest #${artistId} - ${donorName}`,
      redirectUrl: `${protocol}://${host}${normalizedReturnPath}?donation=success&orderId=${order.id}`,
      webhookUrl: `${protocol}://${host}/api/checkout/webhook`,
      metadata: {
        orderId: order.id.toString(),
        artistId: artistId.toString(),
        type: 'donation',
        market: market.market_code,
      }
    });

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: payment._links?.checkout?.href || payment.checkoutUrl 
    });

  } catch (error: any) {
    console.error(' Donation API Error:', error);
    return NextResponse.json({ error: error.message || 'Donation failed' }, { status: 500 });
  }
}
