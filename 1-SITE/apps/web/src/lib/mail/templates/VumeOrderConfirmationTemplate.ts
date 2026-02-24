import { BaseTemplate } from './VumeMasterWrapper';
import { SlimmeKassa } from '@/lib/engines/pricing-engine';

/**
 * 🛒 ORDER CONFIRMATION TEMPLATE (2026)
 * 
 * Doel: Een prachtige bevestiging voor de klant met order-details en next steps.
 */

interface OrderConfirmationProps {
  userName: string;
  orderId: string;
  total: number;
  items: Array<{
    name: string;
    price: number;
    deliveryTime?: string;
  }>;
  paymentMethod: string;
  host?: string;
  language?: string;
}

export const VumeOrderConfirmationTemplate = (props: OrderConfirmationProps) => {
  const { 
    userName, 
    orderId, 
    total,
    items,
    paymentMethod,
    host,
    language = 'nl'
  } = props;

  const isNl = language === 'nl';

  const itemsHtml = items.map(item => `
    <div style="padding: 15px; background: #f9f9f9; border-radius: 12px; margin-bottom: 10px; border: 1px solid #eee;">
      <div style="font-weight: bold; color: #1a1a1a;">${item.name}</div>
      <div style="font-size: 13px; color: #666; margin-top: 4px;">
        ${item.deliveryTime ? `${isNl ? 'Levering:' : 'Delivery:'} ${item.deliveryTime}` : ''}
        <span style="float: right; font-weight: bold;">${SlimmeKassa.format(item.price)}</span>
      </div>
    </div>
  `).join('');

  const content = `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #1a1a1a;">${isNl ? 'Beste' : 'Dear'} ${userName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #666;">
        ${isNl 
          ? `Bedankt voor je bestelling bij <strong>${host || 'Voices.be'}</strong>! We zijn direct voor je aan de slag gegaan. Hieronder vind je een overzicht van je project.` 
          : `Thank you for your order at <strong>${host || 'Voices.be'}</strong>! We have started working on it immediately. Below you will find an overview of your project.`}
      </p>
    </div>

    <div style="background: #fcfaf7; border-radius: 20px; padding: 25px; border: 1px solid #eee; margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 15px;">${isNl ? 'Besteloverzicht' : 'Order Summary'}</div>
      <div style="margin-bottom: 20px;">
        ${itemsHtml}
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #eee; pt-15px;">
        <tr>
          <td style="padding-top: 15px; font-size: 16px; color: #1a1a1a; font-weight: bold;">${isNl ? 'Totaal (incl. BTW)' : 'Total (incl. VAT)'}:</td>
          <td style="padding-top: 15px; font-size: 18px; color: #ff4f00; font-weight: bold; text-align: right;">${SlimmeKassa.format(total)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${isNl ? 'Wat gebeurt er nu?' : 'What happens next?'}</div>
      <div style="font-size: 15px; line-height: 1.6; color: #666;">
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">${isNl ? 'De stemacteur is op de hoogte gebracht en plant de opname in.' : 'The voice actor has been notified and is scheduling the recording.'}</li>
          <li style="margin-bottom: 10px;">${isNl ? 'Zodra de audio klaar is, ontvang je een e-mail met een download-link.' : 'As soon as the audio is ready, you will receive an email with a download link.'}</li>
          <li style="margin-bottom: 10px;">${isNl ? 'Je kunt de status van je project op elk moment volgen in je account.' : 'You can track the status of your project at any time in your account.'}</li>
        </ul>
      </div>
    </div>

    <div style="background: #fff5f0; padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 79, 0, 0.1); margin-bottom: 30px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        ${isNl 
          ? 'Heb je vragen? Reageer direct op deze e-mail of neem contact op via onze chat.' 
          : 'Questions? Reply directly to this email or contact us via our chat.'}
      </p>
    </div>
  `;

  return BaseTemplate({
    title: isNl ? 'Bestelling Bevestigd' : 'Order Confirmed',
    journey: 'agency',
    host,
    children: content
  });
};
