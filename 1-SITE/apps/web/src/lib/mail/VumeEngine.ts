import { DirectMailService } from '@/services/DirectMailService';
import { VumeMagicLinkTemplate } from './templates/VumeMagicLinkTemplate';
import { VumeStudioTemplate } from './templates/VumeStudioTemplate';
import { VumeInvoiceReplyTemplate } from './templates/VumeInvoiceReplyTemplate';

/**
 * 🚀 VUME ENGINE (2026)
 * 
 * Het centrale zenuwcentrum voor alle e-mails uit de Schouwburg.
 */

interface SendOptions {
  to: string;
  subject: string;
  template: 'magic-link' | 'studio-experience' | 'invoice-reply';
  context: any;
  from?: string;
  host?: string;
}

export class VumeEngine {
  static async send(options: SendOptions) {
    const { to, subject, template, context, from, host } = options;
    
    let html = '';
    
    switch (template) {
      case 'magic-link':
        html = VumeMagicLinkTemplate({
          name: context.name,
          link: context.link,
          host: host,
          language: context.language || 'nl'
        });
        break;
      
      case 'studio-experience':
        html = VumeStudioTemplate({
          name: context.name,
          workshopName: context.workshopName,
          date: context.date,
          time: context.time,
          location: context.location,
          host: host,
          language: context.language || 'nl'
        });
        break;

      case 'invoice-reply':
        html = VumeInvoiceReplyTemplate({
          userName: context.userName,
          invoiceNumber: context.invoiceNumber,
          amount: context.amount,
          host: host,
          language: context.language || 'nl'
        });
        break;
      default:
        throw new Error(`Template ${template} niet gevonden in VUME.`);
    }

    const mailService = DirectMailService.getInstance();
    await mailService.sendMail({
      to,
      subject,
      html,
      from,
      host
    });

    console.log(`[VUME ✉️] Mail verzonden via template: ${template} naar ${to}`);
  }
}
