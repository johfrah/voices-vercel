import { BaseTemplate } from './VumeMasterWrapper';
import { formatCurrency } from '@/lib/utils/format-utils';
import { localeToBcp47, normalizeLocale } from '@/lib/system/locale-utils';

/**
 * 🛒 ORDER CONFIRMATION TEMPLATE (2026)
 * 
 * Doel: Een prachtige bevestiging voor de klant met order-details en next steps.
 */

interface OrderConfirmationProps {
  userName: string;
  orderId: string;
  total: number;
  subtotal?: number;
  tax?: number;
  items: Array<{
    name: string;
    price: number;
    quantity?: number;
    unitPrice?: number;
    deliveryTime?: string;
    description?: string;
    thumbnailUrl?: string;
    projectCode?: string;
  }>;
  paymentMethod: string;
  ctaUrl?: string;
  host?: string;
  language?: string;
}

export const VumeOrderConfirmationTemplate = (props: OrderConfirmationProps) => {
  const {
    userName,
    orderId,
    total,
    subtotal,
    tax,
    items,
    paymentMethod,
    ctaUrl,
    host,
    language = 'nl-be',
  } = props;

  const normalizedLanguage = normalizeLocale(language || 'nl-be');
  const languageShort = normalizedLanguage.split('-')[0];
  const formatLocale = localeToBcp47(normalizedLanguage);
  const isNl = languageShort === 'nl';
  const isFr = languageShort === 'fr';
  const safeItems = Array.isArray(items) ? items : [];
  const txt = (nl: string, fr: string, en: string) => (isFr ? fr : isNl ? nl : en);
  const ctaHref = ctaUrl || `https://${host || 'www.voices.be'}/account/orders?orderId=${encodeURIComponent(orderId)}`;
  const safeSubtotal = typeof subtotal === 'number'
    ? subtotal
    : safeItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const safeTax = typeof tax === 'number' ? tax : Math.max(0, Number(total || 0) - safeSubtotal);
  const safeTotal = Number(total || safeSubtotal + safeTax);
  const escapeHtml = (value: string) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const greetingName = userName ? ` ${escapeHtml(userName)}` : '';

  const renderThumbnail = (item: OrderConfirmationProps['items'][number]) => {
    if (item.thumbnailUrl) {
      return `
        <img src="${item.thumbnailUrl}" alt="${escapeHtml(item.name)}" width="52" height="52" style="display: block; width: 52px; height: 52px; border-radius: 999px; object-fit: cover; border: 1px solid #E5E7EB;" />
      `;
    }

    const initials = (item.name || 'P')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
    return `
      <div style="width: 52px; height: 52px; border-radius: 999px; border: 1px solid #E5E7EB; background: #F9FAFB; text-align: center; line-height: 52px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #4B5563; font-weight: 600;">
        ${escapeHtml(initials || 'P')}
      </div>
    `;
  };

  const itemsHtml = safeItems
    .map((item, index) => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const linePrice = Number(item.price || 0);
      const unitPrice = Number(item.unitPrice || linePrice / quantity);
      const detailParts = [
        item.description ? escapeHtml(item.description) : '',
        item.projectCode ? `${txt('Project', 'Projet', 'Project')}: ${escapeHtml(item.projectCode)}` : '',
        item.deliveryTime ? `${txt('Levering', 'Livraison', 'Delivery')}: ${escapeHtml(item.deliveryTime)}` : '',
      ].filter(Boolean);
      return `
        <tr>
          <td style="padding: 16px 8px 16px 0; border-bottom: ${index === safeItems.length - 1 ? 'none' : '1px solid #F3F4F6'};">
            ${renderThumbnail(item)}
          </td>
          <td style="padding: 16px 8px; border-bottom: ${index === safeItems.length - 1 ? 'none' : '1px solid #F3F4F6'}; vertical-align: top;">
            <div style="font-size: 15px; color: #111827; font-weight: 600;">${escapeHtml(item.name || txt('Product', 'Produit', 'Product'))}</div>
            <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">${txt('Aantal', 'Quantité', 'Quantity')}: ${quantity} &bull; ${txt('Stukprijs', 'Prix unitaire', 'Unit price')}: ${formatCurrency(unitPrice, formatLocale)}</div>
            ${detailParts.length > 0 ? `<div style="font-size: 13px; color: #6B7280; margin-top: 6px; line-height: 1.5;">${detailParts.join('<br />')}</div>` : ''}
          </td>
          <td style="padding: 16px 0 16px 8px; border-bottom: ${index === safeItems.length - 1 ? 'none' : '1px solid #F3F4F6'}; text-align: right; vertical-align: top; white-space: nowrap; font-size: 15px; color: #111827; font-weight: 700;">
            ${formatCurrency(linePrice, formatLocale)}
          </td>
        </tr>
      `;
    })
    .join('');

  const content = `
    <div style="margin-bottom: 18px;">
      <p style="margin: 0 0 8px 0; font-size: 18px; color: #111827; font-weight: 600;">${txt('Beste', 'Bonjour', 'Dear')}${greetingName},</p>
      <p style="margin: 0; font-size: 15px; line-height: 1.66; color: #4B5563; text-align: left;">
        ${txt(
          `Bedankt voor je bestelling. Hieronder vind je je overzicht.`,
          `Merci pour votre commande. Voici votre aperçu.`,
          `Thank you for your order. Here is your overview.`
        )}
      </p>
    </div>

    <div style="border: 1px solid #E5E7EB; border-radius: 16px; padding: 20px; margin-bottom: 12px; background: #FFFFFF;">
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.09em; color: #9CA3AF; margin-bottom: 10px;">${txt('Besteloverzicht', 'Récapitulatif', 'Order summary')}</div>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 10px;">
        <tr>
          <td style="width: 60px; padding-bottom: 8px; font-size: 12px; color: #9CA3AF;">&nbsp;</td>
          <td style="padding-bottom: 8px; font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.07em;">${txt('Product', 'Produit', 'Item')}</td>
          <td style="padding-bottom: 8px; text-align: right; font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.07em;">${txt('Prijs', 'Prix', 'Price')}</td>
        </tr>
        ${itemsHtml}
      </table>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #E5E7EB; margin-top: 6px;">
        <tr>
          <td style="padding-top: 14px; font-size: 14px; color: #4B5563;">${txt('Subtotaal', 'Sous-total', 'Subtotal')}</td>
          <td style="padding-top: 14px; text-align: right; font-size: 14px; color: #111827;">${formatCurrency(safeSubtotal, formatLocale)}</td>
        </tr>
        <tr>
          <td style="padding-top: 8px; font-size: 14px; color: #4B5563;">${txt('BTW', 'TVA', 'VAT')}</td>
          <td style="padding-top: 8px; text-align: right; font-size: 14px; color: #111827;">${formatCurrency(safeTax, formatLocale)}</td>
        </tr>
        <tr>
          <td style="padding-top: 8px; font-size: 14px; color: #4B5563;">${txt('Betaling', 'Paiement', 'Payment')}</td>
          <td style="padding-top: 8px; text-align: right; font-size: 14px; color: #111827;">${escapeHtml(paymentMethod || txt('Online betaling', 'Paiement en ligne', 'Online payment'))}</td>
        </tr>
        <tr>
          <td style="padding-top: 12px; font-size: 16px; color: #111827; font-weight: 700;">${txt('Totaal', 'Total', 'Total')}</td>
          <td style="padding-top: 12px; text-align: right; font-size: 18px; color: #111827; font-weight: 700;">${formatCurrency(safeTotal, formatLocale)}</td>
        </tr>
      </table>
    </div>
  `;

  return BaseTemplate({
    title: txt('Bestelling ontvangen', 'Commande reçue', 'Order received'),
    journey: 'agency',
    host,
    language: normalizedLanguage,
    cta: {
      label: txt('Volg je project', 'Suivre le projet', 'Track your project'),
      url: ctaHref,
    },
    children: content,
  });
};
