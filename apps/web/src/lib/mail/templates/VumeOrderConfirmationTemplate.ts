import { BaseTemplate } from './VumeMasterWrapper';
import { formatCurrency } from '@/lib/utils/format-utils';

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
    language = 'nl-be'
  } = props;

  const languageShort = (language || 'nl').toLowerCase().split('-')[0];
  const isNl = languageShort === 'nl';
  const isFr = languageShort === 'fr';
  const safeItems = Array.isArray(items) ? items : [];
  const txt = (nl: string, fr: string, en: string) => (isFr ? fr : isNl ? nl : en);

  const itemsHtml = safeItems.map(item => `
    <div style="padding: 15px; background: #f9f9f9; border-radius: 12px; margin-bottom: 10px; border: 1px solid #eee;">
      <div style="font-weight: bold; color: #1a1a1a;">${item.name}</div>
      <div style="font-size: 13px; color: #666; margin-top: 4px;">
        ${item.deliveryTime ? `${txt('Levering:', 'Livraison :', 'Delivery:')} ${item.deliveryTime}` : ''}
        <span style="float: right; font-weight: bold;">${formatCurrency(item.price)}</span>
      </div>
    </div>
  `).join('');

  const content = `
    <div style="margin-bottom: 30px;">
      <p style="font-size: 18px; color: #1a1a1a;">${txt('Beste', 'Cher/Chère', 'Dear')} ${userName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #666;">
        ${txt(
          `Bedankt voor je bestelling bij <strong>${host || 'Voices'}</strong>! We zijn direct voor je aan de slag gegaan. Hieronder vind je een overzicht van je project.`,
          `Merci pour votre commande chez <strong>${host || 'Voices'}</strong> ! Nous avons déjà lancé votre projet. Voici un aperçu de votre commande.`,
          `Thank you for your order at <strong>${host || 'Voices'}</strong>! We have started working on it immediately. Below you will find an overview of your project.`
        )}
      </p>
    </div>

    <div style="background: #fcfaf7; border-radius: 20px; padding: 25px; border: 1px solid #eee; margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 15px;">${txt('Jouw project', 'Votre projet', 'Your project')}</div>
      <div style="margin-bottom: 20px;">
        ${itemsHtml}
      </div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #eee; pt-15px;">
        <tr>
          <td style="padding-top: 15px; font-size: 16px; color: #1a1a1a; font-weight: bold;">${txt('Totaal (incl. BTW)', 'Total (TVA incluse)', 'Total (incl. VAT)')}:</td>
          <td style="padding-top: 15px; font-size: 18px; color: #ff4f00; font-weight: bold; text-align: right;">${formatCurrency(total)}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #bbbbbb; margin-bottom: 10px;">${txt('Hoe gaan we verder?', 'Et maintenant ?', 'What happens next?')}</div>
      <div style="font-size: 15px; line-height: 1.6; color: #666;">
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 10px;">${txt('We hebben de stem gebriefd en de opname wordt ingepland.', "Le/la comédien(ne) voix a été briefé(e) et l'enregistrement est planifié.", 'The voice actor has been notified and is scheduling the recording.')}</li>
          <li style="margin-bottom: 10px;">${txt('Zodra de opname klaar is, ontvang je een e-mail met een download-link.', "Dès que l'enregistrement est prêt, vous recevrez un e-mail avec un lien de téléchargement.", 'As soon as the recording is ready, you will receive an email with a download link.')}</li>
          <li style="margin-bottom: 10px;">${txt('Je kunt de status van je project op elk moment volgen in je overzicht.', 'Vous pouvez suivre le statut de votre projet à tout moment dans votre tableau de bord.', 'You can track the status of your project at any time in your overview.')}</li>
        </ul>
      </div>
    </div>

    <div style="background: #fff5f0; padding: 20px; border-radius: 15px; border: 1px solid rgba(255, 79, 0, 0.1); margin-bottom: 30px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
        ${txt(
          'Heb je vragen? Reageer direct op deze e-mail of neem contact op via onze chat.',
          'Une question ? Répondez directement à cet e-mail ou contactez-nous via le chat.',
          'Questions? Reply directly to this email or contact us via our chat.'
        )}
      </p>
    </div>
  `;

  return BaseTemplate({
    title: txt('Je opdracht is goed ontvangen', 'Votre commande est confirmée', 'Order confirmed'),
    journey: 'agency',
    children: content
  });
};
