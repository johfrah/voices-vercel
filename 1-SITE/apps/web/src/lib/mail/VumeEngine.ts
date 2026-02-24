import { DirectMailService } from '@/lib/services/direct-mail-service';
import { VumeMagicLinkTemplate } from './templates/VumeMagicLinkTemplate';
import { VumeStudioTemplate } from './templates/VumeStudioTemplate';
import { VumeInvoiceReplyTemplate } from './templates/VumeInvoiceReplyTemplate';
import { VumeActorAssignmentTemplate } from './templates/VumeActorAssignmentTemplate';
import { VumeNewAccountTemplate } from './templates/VumeNewAccountTemplate';
import { VumeDonationThankYouTemplate } from './templates/VumeDonationThankYouTemplate';
import { VumeOrderConfirmationTemplate } from './templates/VumeOrderConfirmationTemplate';

/**
 *  VUME ENGINE (2026)
 * 
 * Het centrale zenuwcentrum voor alle e-mails uit Voices.
 */

interface SendOptions {
  to: string;
  subject: string;
  template: 'magic-link' | 'studio-experience' | 'invoice-reply' | 'actor-assignment' | 'new-account' | 'donation-thank-you' | 'order-confirmation';
  context: any;
  from?: string;
  host?: string;
  language?: string;
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
          headerImage: context.headerImage, // Pass specific workshop header
          host: host,
          language: context.language || 'nl',
          optOutToken: context.optOutToken,
          email: to
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

      case 'actor-assignment':
        html = VumeActorAssignmentTemplate({
          actorName: context.actorName,
          orderId: context.orderId,
          clientName: context.clientName,
          clientCompany: context.clientCompany,
          usageType: context.usageType,
          script: context.script,
          briefing: context.briefing,
          deliveryTime: context.deliveryTime,
          host: host,
          language: context.language || 'nl'
        });
        break;

      case 'new-account':
        html = VumeNewAccountTemplate({
          name: context.name,
          host: host,
          language: context.language || 'nl'
        });
        break;

      case 'donation-thank-you':
        html = VumeDonationThankYouTemplate({
          name: context.name,
          amount: context.amount,
          artistName: context.artistName,
          message: context.message,
          host: host,
          language: context.language || 'nl'
        });
        break;

      case 'order-confirmation':
        html = VumeOrderConfirmationTemplate({
          userName: context.userName,
          orderId: context.orderId,
          total: context.total,
          items: context.items,
          paymentMethod: context.paymentMethod,
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

    console.log(`[VUME ] Mail verzonden via template: ${template} naar ${to}`);
  }
}
