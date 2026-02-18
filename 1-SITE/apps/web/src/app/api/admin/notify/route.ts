import { NextRequest, NextResponse } from 'next/server';
import { VoicesMailEngine } from '@/services/VoicesMailEngine';
import { MarketManager } from '@config/market-manager';

/**
 *  ADMIN NOTIFICATION API (2026)
 * 
 * Centrale hub voor het versturen van real-time meldingen naar de admin
 * bij belangrijke gebeurtenissen op de site.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    const host = request.headers.get('host') || 'voices.be';
    const market = MarketManager.getCurrentMarket(host);
    const adminEmail = process.env.ADMIN_EMAIL || market.email;

    const mailEngine = VoicesMailEngine.getInstance();

    if (type === 'add_to_cart') {
      const { actorName, price, email, usage } = data;
      
      // CHRIS-PROTOCOL: Gebruik de VoicesMailEngine voor consistente styling
      await mailEngine.sendVoicesMail({
        to: adminEmail,
        subject: `🛒 Mandje: ${actorName} (€${price.toFixed(2)})`,
        title: 'Nieuwe activiteit',
        body: `Er is zojuist een item toegevoegd aan een winkelmandje.<br/><br/>
               <strong>Item:</strong> ${actorName}<br/>
               <strong>Prijs:</strong> €${price.toFixed(2)} (excl. BTW)<br/>
               <strong>Type:</strong> ${usage || 'Onbekend'}<br/>
               <strong>Bezoeker:</strong> ${email || 'Anoniem'}`,
        buttonText: 'Open Dashboard',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/admin/dashboard`
      });
    }

    if (type === 'quote_request') {
      const { orderId, email, amount, company } = data;
      await mailEngine.sendVoicesMail({
        to: adminEmail,
        subject: `📄 Nieuwe Offerte-aanvraag: #${orderId}`,
        title: 'Offerte aangevraagd',
        body: `Er is een nieuwe offerte-aanvraag binnengekomen.<br/><br/>
               <strong>Order ID:</strong> #${orderId}<br/>
               <strong>Bedrag:</strong> €${parseFloat(amount).toFixed(2)} (excl. BTW)<br/>
               <strong>Klant:</strong> ${email}<br/>
               <strong>Bedrijf:</strong> ${company || 'N/A'}`,
        buttonText: 'Bekijk Offerte',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/admin/orders?orderId=${orderId}`
      });
    }

    if (type === 'banktransfer_order') {
      const { orderId, email, amount, company } = data;
      await mailEngine.sendVoicesMail({
        to: adminEmail,
        subject: `🏦 Nieuwe Bestelling (Overschrijving): #${orderId}`,
        title: 'Bestelling op factuur',
        body: `Er is een nieuwe bestelling geplaatst via bankoverschrijving.<br/><br/>
               <strong>Order ID:</strong> #${orderId}<br/>
               <strong>Bedrag:</strong> €${parseFloat(amount).toFixed(2)} (incl. BTW)<br/>
               <strong>Klant:</strong> ${email}<br/>
               <strong>Bedrijf:</strong> ${company || 'N/A'}<br/><br/>
               De factuur is reeds aangemaakt in Yuki.`,
        buttonText: 'Beheer Bestelling',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/admin/orders?orderId=${orderId}`
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [Admin Notify] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
