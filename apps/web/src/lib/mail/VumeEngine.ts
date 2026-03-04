import { DirectMailService } from '@/lib/services/direct-mail-service';
import { VumeMagicLinkTemplate } from './templates/VumeMagicLinkTemplate';
import { VumeStudioTemplate } from './templates/VumeStudioTemplate';
import { VumeInvoiceReplyTemplate } from './templates/VumeInvoiceReplyTemplate';
import { VumeActorAssignmentTemplate } from './templates/VumeActorAssignmentTemplate';
import { VumeNewAccountTemplate } from './templates/VumeNewAccountTemplate';
import { VumeDonationThankYouTemplate } from './templates/VumeDonationThankYouTemplate';
import { VumeOrderConfirmationTemplate } from './templates/VumeOrderConfirmationTemplate';
import { VumeFollowUpTemplate } from './templates/VumeFollowUpTemplate';
import { VumeActorReminderTemplate } from './templates/VumeActorReminderTemplate';
import { normalizeLocale } from '@/lib/system/locale-utils';
import { EmailHandshakeService } from './email-handshake-service';
import { MarketManagerServer as MarketManager } from '@/lib/system/core/market-manager';

/**
 *  VUME ENGINE (2026)
 * 
 * Het centrale zenuwcentrum voor alle e-mails uit Voices.
 */

interface SendOptions {
  to: string;
  subject: string;
  template: 'magic-link' | 'studio-experience' | 'invoice-reply' | 'actor-assignment' | 'actor-reminder' | 'new-account' | 'donation-thank-you' | 'order-confirmation' | 'follow-up';
  context: any;
  from?: string;
  host?: string;
  language?: string;
}

const TEMPLATE_JOURNEY_MAP: Record<SendOptions['template'], 'agency' | 'artist' | 'portfolio' | 'studio' | 'auth'> = {
  'magic-link': 'auth',
  'studio-experience': 'studio',
  'invoice-reply': 'agency',
  'actor-assignment': 'agency',
  'actor-reminder': 'agency',
  'new-account': 'agency',
  'donation-thank-you': 'artist',
  'order-confirmation': 'agency',
  'follow-up': 'agency',
};

export class VumeEngine {
  static async send(options: SendOptions) {
    const { to, subject, template, context, from, host } = options;
    const resolvedLanguage = normalizeLocale(options.language || context?.language || 'nl-be');
    
    let html = '';
    
    switch (template) {
      case 'magic-link':
        html = VumeMagicLinkTemplate({
          name: context.name,
          link: context.link,
          host: host,
          language: resolvedLanguage
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
          language: resolvedLanguage,
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
          language: resolvedLanguage
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
          language: resolvedLanguage
        });
        break;

      case 'actor-reminder':
        html = VumeActorReminderTemplate({
          actorName: context.actorName,
          orderId: context.orderId,
          usageType: context.usageType,
          deliveryTime: context.deliveryTime,
          isOverdue: context.isOverdue,
          host: host,
          language: resolvedLanguage,
        });
        break;

      case 'new-account':
        html = VumeNewAccountTemplate({
          name: context.name,
          host: host,
          language: resolvedLanguage
        });
        break;

      case 'donation-thank-you':
        html = VumeDonationThankYouTemplate({
          name: context.name,
          amount: context.amount,
          artistName: context.artistName,
          message: context.message,
          host: host,
          language: resolvedLanguage
        });
        break;

      case 'order-confirmation':
        html = VumeOrderConfirmationTemplate({
          userName: context.userName,
          orderId: context.orderId,
          total: context.total,
          subtotal: context.subtotal,
          tax: context.tax,
          items: context.items,
          paymentMethod: context.paymentMethod,
          ctaUrl: context.ctaUrl,
          host: host,
          language: resolvedLanguage
        });
        break;

      case 'follow-up':
        html = VumeFollowUpTemplate({
          userName: context.userName,
          orderId: context.orderId,
          actorName: context.actorName,
          host: host,
          language: resolvedLanguage
        });
        break;

      default:
        throw new Error(`Template ${template} niet gevonden in VUME.`);
    }

    const templateJourney = TEMPLATE_JOURNEY_MAP[template] || 'agency';
    const market = MarketManager.getCurrentMarket(host);
    const worldId = MarketManager.getWorldId(templateJourney);
    const targetId = context?.orderId || context?.order_id || context?.userId || context?.user_id || context?.targetId || context?.target_id || null;
    const targetType = context?.orderId || context?.order_id
      ? 'order'
      : context?.userId || context?.user_id
        ? 'user'
        : 'mail';
    const handshakeRow = await EmailHandshakeService.createQueued({
      template_key: template,
      recipient_email: to,
      subject,
      market_code: market.market_code,
      world_id: worldId,
      journey_code: templateJourney,
      language_code: resolvedLanguage,
      source_host: host || null,
      target_type: targetType,
      target_id: targetId ? String(targetId) : null,
      payload: {
        order_id: context?.orderId || context?.order_id || null,
        item_count: Array.isArray(context?.items) ? context.items.length : null,
      },
      meta_data: {
        template,
      },
    });

    const mailService = DirectMailService.getInstance();
    try {
      const sendResult = await mailService.sendMail({
        to,
        subject,
        html,
        from,
        host
      });

      if (handshakeRow?.id) {
        await EmailHandshakeService.markSent({
          id: handshakeRow.id,
          provider_message_id: sendResult.message_id,
        });
      }

      console.log(`[VUME ] Mail verzonden via template: ${template} naar ${to}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Mail send failed';
      if (handshakeRow?.id) {
        await EmailHandshakeService.markFailed({
          id: handshakeRow.id,
          error_message: errorMessage,
        });
      }
      throw error;
    }
  }
}
