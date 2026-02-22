import { VumeMasterWrapper } from './VumeMasterWrapper';

/**
 *  VUME INVOICE REPLY TEMPLATE (2026)
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
  const { userName, invoiceNumber, amount, host = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || 'voices.be', language = 'nl' } = options;

  const content = {
    nl: {
      title: 'Ontvangstbevestiging',
      greeting: userName ? `Beste ${userName},` : 'Beste,',
      body: `Wij bevestigen de goede ontvangst van factuur <strong style="color: #000;">${invoiceNumber || ''}</strong> ${amount ? `voor een totaalbedrag van <strong style="color: #000;">${amount.toFixed(2)}</strong>` : ''}.`,
      processing: 'Deze wordt momenteel verwerkt voor onze boekhouding.',
      thanks: 'Bedankt voor de fijne samenwerking!',
      button: 'BEKIJK IN DASHBOARD',
      footer: 'Dit is een automatische bevestiging. Je hoeft niet te antwoorden op deze mail.'
    },
    fr: {
      title: 'Confirmation de rception',
      greeting: userName ? `Cher ${userName},` : 'Cher,',
      body: `Nous confirmons la bonne rception de la facture <strong style="color: #000;">${invoiceNumber || ''}</strong> ${amount ? `pour un montant total de <strong style="color: #000;">${amount.toFixed(2)}</strong>` : ''}.`,
      processing: 'Celle-ci est en cours de traitement pour notre comptabilit.',
      thanks: 'Merci pour cette agrable collaboration !',
      button: 'VOIR DANS LE TABLEAU DE BORD',
      footer: 'Ceci est une confirmation automatique. Vous n\'avez pas besoin de rpondre  cet e-mail.'
    },
    en: {
      title: 'Receipt confirmation',
      greeting: userName ? `Dear ${userName},` : 'Dear,',
      body: `We confirm the successful receipt of invoice <strong style="color: #000;">${invoiceNumber || ''}</strong> ${amount ? `for a total amount of <strong style="color: #000;">${amount.toFixed(2)}</strong>` : ''}.`,
      processing: 'This is currently being processed for our accounting.',
      thanks: 'Thank you for the pleasant cooperation!',
      button: 'VIEW IN DASHBOARD',
      footer: 'This is an automated confirmation. You do not need to reply to this email.'
    }
  }[language as 'nl' | 'fr' | 'en'] || content.nl;

  const html = `
    <p style="margin: 0 0 20px 0; font-family: 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${content.greeting}</p>
    <p style="margin: 0 0 15px 0; font-family: 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${content.body}</p>
    <p style="margin: 0 0 15px 0; font-family: 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${content.processing}</p>
    <p style="margin: 0 0 32px 0; font-family: 'Raleway', 'Helvetica Neue', Helvetica, Arial, sans-serif;">${content.thanks}</p>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <a href="https://${host}/account/orders" style="display: inline-block; padding: 18px 36px; background-color: #000000; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; font-family: 'Raleway', sans-serif;">${content.button}</a>
        </td>
      </tr>
    </table>
    
    <p style="margin: 40px 0 0 0; font-size: 13px; opacity: 0.6; line-height: 1.6; font-family: 'Raleway', sans-serif;">${content.footer}</p>
  `;

  return VumeMasterWrapper(html, {
    title: content.title,
    previewText: content.title,
    journey: 'agency',
    host
  });
}
