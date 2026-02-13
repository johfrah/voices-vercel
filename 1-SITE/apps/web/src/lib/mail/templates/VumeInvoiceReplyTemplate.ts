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
      body: `We hebben je factuur ${invoiceNumber ? `met nummer <strong style="font-weight: 500; color: #1A1A1A;">${invoiceNumber}</strong>` : ''} goed ontvangen. Onze administratie gaat er direct mee aan de slag.`,
      amountLabel: 'Bedrag:',
      statusLabel: 'Status:',
      statusValue: 'In verwerking',
      button: 'Bekijk in dashboard',
      footer: 'Dit is een automatische bevestiging. Je hoeft niet te antwoorden op deze mail.'
    },
    fr: {
      title: 'Facture bien reçue',
      greeting: userName ? `Bonjour ${userName},` : 'Bonjour,',
      body: `Nous avons bien reçu votre facture ${invoiceNumber ? `numéro <strong style="font-weight: 500; color: #1A1A1A;">${invoiceNumber}</strong>` : ''}. Notre administration s'en occupe immédiatement.`,
      amountLabel: 'Montant:',
      statusLabel: 'Statut:',
      statusValue: 'En cours de traitement',
      button: 'Voir dans le tableau de bord',
      footer: 'Ceci est une confirmation automatique. Vous n\'avez pas besoin de répondre à cet e-mail.'
    },
    en: {
      title: 'Invoice received',
      greeting: userName ? `Hi ${userName},` : 'Hi there,',
      body: `We have successfully received your invoice ${invoiceNumber ? `number <strong style="font-weight: 500; color: #1A1A1A;">${invoiceNumber}</strong>` : ''}. Our administration is processing it right away.`,
      amountLabel: 'Amount:',
      statusLabel: 'Status:',
      statusValue: 'Processing',
      button: 'View in dashboard',
      footer: 'This is an automated confirmation. You do not need to reply to this email.'
    }
  }[language as 'nl' | 'fr' | 'en'] || content.nl;

  const html = `
    <h1 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 200; font-size: 32px; margin: 0 0 30px 0; line-height: 1.2; color: #1A1A1A;">${content.title}</h1>
    <p style="margin: 0 0 20px 0;">${content.greeting}</p>
    <p style="margin: 0 0 32px 0;">${content.body}</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FBFBF9; border-radius: 20px; border: 1px solid #F0F0F0; margin-bottom: 32px;">
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #6B7280;">${content.statusLabel} <span style="color: #1A1A1A; font-weight: 500;">${content.statusValue}</span></p>
          ${amount ? `<p style="margin: 0; font-size: 14px; color: #6B7280;">${content.amountLabel} <span style="color: #1A1A1A; font-weight: 500;">€${amount.toFixed(2)}</span></p>` : ''}
        </td>
      </tr>
    </table>

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://${host}/account/orders" style="display: inline-block; padding: 18px 36px; background-color: #FF4F00; color: #FFFFFF; text-decoration: none; border-radius: 14px; font-weight: 500; font-size: 16px;">${content.button}</a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 40px 0 0 0; font-size: 13px; opacity: 0.6; line-height: 1.6;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.body,
    journey: 'agency',
    host
  });
}
