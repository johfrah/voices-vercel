import { NextRequest, NextResponse } from 'next/server';
import { VoicesMailEngine } from '@/lib/services/voices-mail-engine';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

export const dynamic = 'force-dynamic';

function resolveAdminRecipients(...candidates: Array<string | undefined | null>): string[] {
  const emails = new Set<string>();

  candidates
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter((value) => value.includes('@'))
    .forEach((value) => emails.add(value));

  return Array.from(emails);
}

/**
 *  ADMIN NOTIFICATION API (2026)
 * 
 * Centrale hub voor het versturen van real-time meldingen naar de admin
 * bij belangrijke gebeurtenissen op de site.
 */
export async function POST(request: NextRequest) {
  //  CHRIS-PROTOCOL: Build Safety
  if (process.env.NEXT_PHASE === 'phase-production-build' || (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL)) {
    return NextResponse.json({ success: true, message: 'Skipping notification during build' });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const { type, data = {} } = body || {};

    const host = request.headers.get('host') || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || MarketManager.getMarketDomains()['BE']?.replace('https://', ''));
    const market = MarketManager.getCurrentMarket(host);
    const domains = MarketManager.getMarketDomains();
    const canonicalHost = domains[market.market_code]?.replace('https://', '') || (MarketManager.getMarketDomains()['BE']?.replace('https://', '') || 'www.voices.be');
    const finalHost = host || canonicalHost;
    const siteUrl = domains[market.market_code] || `https://${canonicalHost}`;
    const adminRecipients = resolveAdminRecipients(
      process.env.ADMIN_ALERT_EMAILS,
      process.env.ADMIN_EMAIL,
      market.email
    );

    // CHRIS-PROTOCOL: Skip emails if requested by user (logging to watchdog only)
    const skipEmails = process.env.DISABLE_ADMIN_EMAILS === 'true';

    const mailEngine = VoicesMailEngine.getInstance();

    const sendToAdminRecipients = async (payload: {
      subject: string;
      title: string;
      body: string;
      buttonText?: string;
      buttonUrl?: string;
    }) => {
      if (skipEmails) return;
      if (adminRecipients.length === 0) {
        console.warn('[Admin Notify] No admin recipients configured.');
        return;
      }

      for (const recipient of adminRecipients) {
        await mailEngine.sendVoicesMail({
          to: recipient,
          subject: payload.subject,
          title: payload.title,
          body: payload.body,
          buttonText: payload.buttonText,
          buttonUrl: payload.buttonUrl,
          host: finalHost
        });
      }
    };

    if (type === 'add_to_cart') {
      const { actorName, price, email, usage, actorPhoto, briefing } = data;
      const safePrice = Number(price || 0);
      
      console.log(`[Watchdog] Add to cart: ${actorName} by ${email || 'anonymous'}`);
      
      await sendToAdminRecipients({
        subject: `🛒 Mandje: ${actorName} (€${safePrice.toFixed(2)})`,
        title: 'Nieuwe activiteit',
        body: `
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px; padding: 20px; background: #fcfaf7; border-radius: 20px; border: 1px solid #eee;">
            ${actorPhoto ? `<img src="${actorPhoto}" style="width: 60px; height: 60px; border-radius: 15px; object-fit: cover;" />` : ''}
            <div>
              <div style="font-size: 18px; font-weight: bold; color: #1a1a1a;">${actorName}</div>
              <div style="font-size: 14px; color: #ff4f00; font-weight: 500;">€${safePrice.toFixed(2)} <span style="color: #999; font-weight: 300;">(excl. BTW)</span></div>
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
        buttonUrl: `${siteUrl}/admin/dashboard`
      });
    }

    if (
      type === 'quote_request' ||
      type === 'banktransfer_order' ||
      type === 'sameday_alert' ||
      type === 'payment_received' ||
      type === 'donation_received' ||
      type === 'checkout_submitted' ||
      type === 'payment_status_update' ||
      type === 'checkout_error' ||
      type === 'webhook_error'
    ) {
      const { orderId, email, amount, company, items, customer, isNewUser, artistName, message } = data;
      const safeAmount = Number(amount || 0);
      const paymentStatus = String(data?.paymentStatus || '').toLowerCase();
      const previousStatus = String(data?.previousStatus || '').toLowerCase();
      const paymentMethod = String(data?.paymentMethod || data?.payment_method || '').toLowerCase();
      const usage = String(data?.usage || '').toLowerCase();
      const itemsCount = Number(data?.itemsCount || data?.items_count || 0);
      const technicalError = String(data?.error || '').trim();
      const source = String(data?.source || data?.component || 'unknown');
      const orderJourney = String(data?.journey || '').trim();
      
      console.log(`[Watchdog] ${type.toUpperCase()}: Order #${orderId} - ${email}`);

      const isQuote = type === 'quote_request';
      const isSameDay = type === 'sameday_alert';
      const isPayment = type === 'payment_received';
      const isDonation = type === 'donation_received';
      const isCheckoutSubmitted = type === 'checkout_submitted';
      const isPaymentStatusUpdate = type === 'payment_status_update';
      const isCheckoutError = type === 'checkout_error';
      const isWebhookError = type === 'webhook_error';
      
      const itemsHtml = isDonation ? `
        <div style="padding: 15px; background: #f9f9f9; border-radius: 12px; margin-bottom: 10px; border: 1px solid #eee;">
          <div style="font-weight: bold; color: #1a1a1a;">Donatie voor ${artistName || 'Artiest'}</div>
          ${message ? `<div style="font-size: 12px; color: #999; margin-top: 8px; font-style: italic; border-left: 2px solid #ddd; padding-left: 10px;">"${message}"</div>` : ''}
        </div>
      ` : (items || []).map((item: any) => {
        const itemPrice = Number(item?.pricing?.total || item?.pricing?.subtotal || 0);
        return `
        <div style="padding: 15px; background: #f9f9f9; border-radius: 12px; margin-bottom: 10px; border: 1px solid #eee;">
          <div style="font-weight: bold; color: #1a1a1a;">${item.actor?.display_name || item.actor?.first_name || 'Stemopname'}</div>
          <div style="font-size: 13px; color: #666; margin-top: 4px;">
            ${item.usage === 'commercial' ? 'Commercial' : item.usage === 'telefonie' ? 'Telefoon' : 'Online Video'} 
            • €${itemPrice.toFixed(2)}
          </div>
          ${item.script || item.briefing ? `<div style="font-size: 12px; color: #999; margin-top: 8px; font-style: italic; border-left: 2px solid #ddd; padding-left: 10px;">"${(item.script || item.briefing).substring(0, 100)}${(item.script || item.briefing).length > 100 ? '...' : ''}"</div>` : ''}
        </div>
      `;
      }).join('');

      let subject = isQuote ? `📄 Offerte: #${orderId} - ${company || email}` : `🏦 Overschrijving: #${orderId} - ${company || email}`;
      let title = isQuote ? 'Nieuwe Offerte-aanvraag' : 'Nieuwe Bestelling (Factuur)';
      let buttonText = isDonation ? 'Bekijk Donaties' : isQuote ? 'Open Offerte' : 'Beheer Bestelling';
      let buttonUrl = isDonation ? `${siteUrl}/backoffice/donations` : `${siteUrl}/admin/orders?orderId=${orderId}`;
      let detailsHtml = `
        <div style="margin-bottom: 30px;">
          <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isDonation ? 'Donateur' : 'Klantgegevens'}</div>
          <div style="font-size: 18px; color: #1a1a1a; font-weight: 400;">
            ${customer?.first_name || ''} ${customer?.last_name || ''}<br/>
            <a href="mailto:${email}" style="color: #ff4f00; text-decoration: none;">${email}</a><br/>
            ${company ? `<strong>${company}</strong><br/>` : ''}
            ${customer?.phone ? `Tel: ${customer.phone}` : ''}
          </div>
          ${isNewUser ? `
            <div style="display: inline-block; margin-top: 10px; background: #ff4f00; color: #fff; font-size: 11px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; font-weight: bold;">
              Nieuwe Klant ✨
            </div>
          ` : ''}
        </div>
      
        <div style="margin-bottom: 30px;">
          <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isDonation ? 'Donatie' : 'Bestelling'} #${orderId}</div>
          <div style="font-size: 32px; color: #1a1a1a; font-weight: 200; margin-bottom: 20px;">
            €${safeAmount.toFixed(2)} ${!isDonation ? '<span style="font-size: 14px; color: #999;">(excl. BTW)</span>' : ''}
          </div>
          ${itemsHtml}
        </div>

        <div style="background: #fff5f0; padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 79, 0, 0.1); margin-bottom: 30px;">
          <div style="font-size: 13px; color: #ff4f00; font-weight: bold; margin-bottom: 5px;">${isDonation ? 'INFO' : 'ACTIE VEREIST'}</div>
          <div style="font-size: 14px; color: #666; line-height: 1.5;">
            ${isDonation ? `Er is een nieuwe donatie binnengekomen voor ${artistName}. De bedankmail is automatisch verstuurd naar de donateur.` : isSameDay ? 'Een acteur heeft een Same-Day belofte gedaan. Monitor de upload en valideer direct na ontvangst.' : isQuote ? 'De klant wacht op een reactie op deze offerte. Bekijk de details en stuur de definitieve versie.' : isPayment ? 'De betaling is succesvol verwerkt. De stemacteur(s) zijn op de hoogte gebracht.' : 'De factuur is aangemaakt in Yuki. Controleer de betaling en zet de order op "In behandeling" zodra akkoord.'}
          </div>
        </div>
      `;

      if (isCheckoutSubmitted) {
        subject = `🧾 Checkout gestart: #${orderId} - ${company || email || 'onbekend'}`;
        title = 'Nieuwe Checkout Ingediend';
        buttonText = 'Open Order';
        buttonUrl = `${siteUrl}/admin/orders?orderId=${orderId}`;
        detailsHtml = `
          <div style="margin-bottom: 24px;">
            <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">Order #${orderId}</div>
            <div style="font-size: 30px; color: #1a1a1a; font-weight: 200;">€${safeAmount.toFixed(2)}</div>
          </div>
          <div style="background: #fcfaf7; padding: 16px; border-radius: 12px; border: 1px solid #eee; font-size: 14px; color: #666; line-height: 1.7;">
            <strong>E-mail:</strong> ${email || 'onbekend'}<br/>
            <strong>Bedrijf:</strong> ${company || '-'}<br/>
            <strong>Payment:</strong> ${paymentMethod || '-'}<br/>
            <strong>Journey:</strong> ${orderJourney || '-'}<br/>
            <strong>Usage:</strong> ${usage || '-'}<br/>
            <strong>Items:</strong> ${itemsCount || (Array.isArray(items) ? items.length : 0)}
          </div>
          <div style="margin-top: 20px; background: #fff5f0; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,79,0,0.1); font-size: 13px; color: #666;">
            Signaal is verzonden bij order-aanmaak, nog vóór finale betaalstatus.
          </div>
        `;
      }

      if (isPaymentStatusUpdate) {
        subject = `💳 Betaalstatus update: #${orderId} → ${paymentStatus || 'onbekend'}`;
        title = 'Webhook Statusupdate';
        buttonText = 'Open Order';
        buttonUrl = `${siteUrl}/admin/orders?orderId=${orderId}`;
        detailsHtml = `
          <div style="background: #fcfaf7; padding: 16px; border-radius: 12px; border: 1px solid #eee; font-size: 14px; color: #666; line-height: 1.7;">
            <strong>Order:</strong> #${orderId}<br/>
            <strong>E-mail:</strong> ${email || '-'}<br/>
            <strong>Bedrag:</strong> €${safeAmount.toFixed(2)}<br/>
            <strong>Status:</strong> ${paymentStatus || '-'}<br/>
            <strong>Vorige status:</strong> ${previousStatus || '-'}<br/>
            <strong>Payment ID:</strong> ${data?.paymentId || '-'}<br/>
            <strong>Bron:</strong> Mollie webhook
          </div>
          <div style="margin-top: 20px; background: #f0f9ff; padding: 14px; border-radius: 12px; border: 1px solid rgba(14,165,233,0.2); font-size: 13px; color: #666;">
            Deze update wordt verstuurd voor betaalstatus-transities zodat je actief zicht hebt op paid/failed/cancelled/expired.
          </div>
        `;
      }

      if (isCheckoutError || isWebhookError) {
        const eventLabel = isCheckoutError ? 'Checkout Error' : 'Webhook Error';
        subject = `🚨 ${eventLabel}: order #${orderId || '-'} - ${source}`;
        title = isCheckoutError ? 'Checkout Flow Fout' : 'Webhook Fout';
        buttonText = 'Open Orders';
        buttonUrl = `${siteUrl}/admin/orders`;
        detailsHtml = `
          <div style="background: #fdf2f8; border-left: 4px solid #ff007a; padding: 20px; margin: 10px 0 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #ff007a;">FOUTMELDING</p>
            <code style="font-family: monospace; font-size: 13px; color: #000; display: block; word-break: break-all;">
              ${technicalError || 'Onbekende fout'}
            </code>
          </div>
          <div style="background: #fff; border: 1px solid #eee; padding: 14px; border-radius: 12px; font-size: 13px; color: #666; line-height: 1.6;">
            <strong>Order:</strong> #${orderId || '-'}<br/>
            <strong>Bron:</strong> ${source}<br/>
            <strong>Klant:</strong> ${email || '-'}<br/>
            <strong>Bedrag:</strong> €${safeAmount.toFixed(2)}<br/>
            <strong>Status:</strong> ${paymentStatus || '-'}
          </div>
        `;
      }

      if (isSameDay) {
        subject = `🚀 URGENT: Same-Day Order #${orderId} - ${company || email}`;
        title = 'URGENT: Same-Day Levering';
      } else if (isPayment) {
        subject = `✅ Betaling: #${orderId} - ${company || email}`;
        title = 'Nieuwe Betaling Ontvangen';
      } else if (isDonation) {
        subject = `💖 Donatie: #${orderId} - ${customer?.first_name || 'Supporter'} voor ${artistName}`;
        title = 'Nieuwe Donatie Ontvangen';
      }

      await sendToAdminRecipients({
        subject,
        title,
        body: `
          ${isSameDay ? `
            <div style="background: #ff4f00; color: #fff; padding: 15px; border-radius: 12px; margin-bottom: 25px; text-align: center; font-weight: bold; letter-spacing: 0.05em;">
              🚀 DEZE ORDER MOET VANDAAG NOG AFGELEVERD WORDEN
            </div>
          ` : ''}
          ${detailsHtml}
        `,
        buttonText,
        buttonUrl
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(' [Admin Notify] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
