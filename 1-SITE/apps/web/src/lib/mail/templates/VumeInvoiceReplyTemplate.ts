import { VumeMasterWrapper } from './VumeMasterWrapper';

/**
 * 🧾 VUME INVOICE REPLY TEMPLATE (2026)
 * 
 * DNA: Mark (Warmte), Lex (Fact-checking), Johfrah (Luxe).
 */

interface InvoiceReplyOptions {
  userName?: string;
  invoiceNumber?: string;
  amount?: number;
  host?: string;
  language?: string;
}

export function VumeInvoiceReplyTemplate(options: InvoiceReplyOptions) {
  const { userName, invoiceNumber, amount, host = 'voices.be', language = 'nl' } = options;

  const content = {
    nl: {
      title: 'Factuur goed ontvangen',
      greeting: userName ? `Hoi ${userName},` : 'Hoi,',
      body: `We hebben je factuur ${invoiceNumber ? `met nummer **${invoiceNumber}**` : ''} goed ontvangen. Onze administratie gaat er direct mee aan de slag.`,
      amountLabel: 'Bedrag:',
      statusLabel: 'Status:',
      statusValue: 'In verwerking',
      button: 'Bekijk in dashboard',
      footer: 'Dit is een automatische bevestiging. Je hoeft niet te antwoorden op deze mail.'
    },
    fr: {
      title: 'Facture bien reçue',
      greeting: userName ? `Bonjour ${userName},` : 'Bonjour,',
      body: `Nous avons bien reçu votre facture ${invoiceNumber ? `numéro **${invoiceNumber}**` : ''}. Notre administration s'en occupe immédiatement.`,
      amountLabel: 'Montant:',
      statusLabel: 'Statut:',
      statusValue: 'En cours de traitement',
      button: 'Voir dans le tableau de bord',
      footer: 'Ceci est une confirmation automatique. Vous n\'avez pas besoin de répondre à cet e-mail.'
    },
    en: {
      title: 'Invoice received',
      greeting: userName ? `Hi ${userName},` : 'Hi there,',
      body: `We have successfully received your invoice ${invoiceNumber ? `number **${invoiceNumber}**` : ''}. Our administration is processing it right away.`,
      amountLabel: 'Amount:',
      statusLabel: 'Status:',
      statusValue: 'Processing',
      button: 'View in dashboard',
      footer: 'This is an automated confirmation. You do not need to reply to this email.'
    }
  }[language as 'nl' | 'fr' | 'en'] || content.nl;

  const html = `
    <h1 style="font-weight: 200; font-size: 32px; margin-bottom: 24px;">${content.title}</h1>
    <p>${content.greeting}</p>
    <p>${content.body}</p>
    
    <div style="background-color: #F9F9F7; border-radius: 20px; padding: 24px; margin-top: 32px; border: 1px solid #F0F0F0;">
      <p style="margin-bottom: 8px; font-size: 14px; color: #6B7280;">${content.statusLabel} <span style="color: #1A1A1A; font-weight: 400;">${content.statusValue}</span></p>
      ${amount ? `<p style="margin-bottom: 0; font-size: 14px; color: #6B7280;">${content.amountLabel} <span style="color: #1A1A1A; font-weight: 400;">€${amount.toFixed(2)}</span></p>` : ''}
    </div>

    <div style="text-align: center; margin-top: 32px;">
      <a href="https://${host}/account/orders" class="button">${content.button}</a>
    </div>
    
    <p style="margin-top: 40px; font-size: 13px; opacity: 0.6; line-height: 1.6;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.body,
    journey: 'agency',
    host
  });
}
