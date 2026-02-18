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
      const { actorName, price, email, usage, actorPhoto, briefing } = data;
      
      // CHRIS-PROTOCOL: Gebruik de VoicesMailEngine voor consistente styling
      await mailEngine.sendVoicesMail({
        to: adminEmail,
        subject: `🛒 Mandje: ${actorName} (€${price.toFixed(2)})`,
        title: 'Nieuwe activiteit',
        body: `
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px; padding: 20px; background: #fcfaf7; border-radius: 20px; border: 1px solid #eee;">
            ${actorPhoto ? `<img src="${actorPhoto}" style="width: 60px; height: 60px; border-radius: 15px; object-fit: cover;" />` : ''}
            <div>
              <div style="font-size: 18px; font-weight: bold; color: #1a1a1a;">${actorName}</div>
              <div style="font-size: 14px; color: #ff4f00; font-weight: 500;">€${price.toFixed(2)} <span style="color: #999; font-weight: 300;">(excl. BTW)</span></div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 8px;">Details</div>
            <div style="font-size: 15px; color: #666; line-height: 1.6;">
              <strong>Type:</strong> ${usage || 'Onbekend'}<br/>
              <strong>Bezoeker:</strong> ${email || 'Anoniem'}<br/>
              ${briefing ? `<div style="margin-top: 10px; font-style: italic; color: #999; border-left: 2px solid #ddd; padding-left: 10px;">"${briefing.substring(0, 150)}${briefing.length > 150 ? '...' : ''}"</div>` : ''}
            </div>
          </div>

          <div style="font-size: 13px; color: #999; border-top: 1px solid #eee; pt-15px;">
            Dit is een real-time signaal van de configurator. De klant heeft dit item zojuist toegevoegd.
          </div>
        `,
        buttonText: 'Bekijk Dashboard',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/admin/dashboard`
      });
    }

    if (type === 'quote_request' || type === 'banktransfer_order') {
      const { orderId, email, amount, company, items, customer } = data;
      const isQuote = type === 'quote_request';
      
      const itemsHtml = (items || []).map((item: any) => `
        <div style="padding: 15px; background: #f9f9f9; border-radius: 12px; margin-bottom: 10px; border: 1px solid #eee;">
          <div style="font-weight: bold; color: #1a1a1a;">${item.actor?.display_name || 'Stemopname'}</div>
          <div style="font-size: 13px; color: #666; margin-top: 4px;">
            ${item.usage === 'commercial' ? 'Commercial' : item.usage === 'telefonie' ? 'Telefoon' : 'Online Video'} 
            • €${(item.pricing?.total || 0).toFixed(2)}
          </div>
          ${item.script ? `<div style="font-size: 12px; color: #999; margin-top: 8px; font-style: italic; border-left: 2px solid #ddd; padding-left: 10px;">"${item.script.substring(0, 100)}${item.script.length > 100 ? '...' : ''}"</div>` : ''}
        </div>
      `).join('');

      await mailEngine.sendVoicesMail({
        to: adminEmail,
        subject: isQuote ? `📄 Offerte: #${orderId} - ${company || email}` : `🏦 Overschrijving: #${orderId} - ${company || email}`,
        title: isQuote ? 'Nieuwe Offerte-aanvraag' : 'Nieuwe Bestelling (Factuur)',
        body: `
          <div style="margin-bottom: 30px;">
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">Klantgegevens</div>
            <div style="font-size: 18px; color: #1a1a1a; font-weight: 400;">
              ${customer?.firstName || ''} ${customer?.lastName || ''}<br/>
              <a href="mailto:${email}" style="color: #ff4f00; text-decoration: none;">${email}</a><br/>
              ${company ? `<strong>${company}</strong><br/>` : ''}
              ${customer?.phone ? `Tel: ${customer.phone}` : ''}
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">Bestelling #${orderId}</div>
            <div style="font-size: 32px; color: #1a1a1a; font-weight: 200; margin-bottom: 20px;">
              €${parseFloat(amount).toFixed(2)} <span style="font-size: 14px; color: #999;">(excl. BTW)</span>
            </div>
            ${itemsHtml}
          </div>

          <div style="background: #fff5f0; padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 79, 0, 0.1); margin-bottom: 30px;">
            <div style="font-size: 13px; color: #ff4f00; font-weight: bold; margin-bottom: 5px;">ACTIE VEREIST</div>
            <div style="font-size: 14px; color: #666; line-height: 1.5;">
              ${isQuote ? 'De klant wacht op een reactie op deze offerte. Bekijk de details en stuur de definitieve versie.' : 'De factuur is aangemaakt in Yuki. Controleer de betaling en zet de order op "In behandeling" zodra akkoord.'}
            </div>
          </div>
        `,
        buttonText: isQuote ? 'Open Offerte' : 'Beheer Bestelling',
        buttonUrl: `${process.env.NEXT_PUBLIC_SITE_URL || `https://${host}`}/admin/orders?orderId=${orderId}`
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [Admin Notify] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
