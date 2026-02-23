import OpenAI from 'openai';
import { DirectMailService } from './direct-mail-service';
import { db } from '@db';
import { approvalQueue } from '@db/schema';
import { InvoiceReceivedTemplate } from '@legacy/php-codebase/backend-services/email-service/src/templates/invoice-received';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

/**
 *  AUTO-REPLY SERVICE v2.3 (2026)
 * 
 * Doel: Genereert zakelijke antwoorden voor facturen in het officile Voices HTML template.
 */
export class AutoReplyService {
  private openai: OpenAI;
  private static instance: AutoReplyService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  public static getInstance(): AutoReplyService {
    if (!AutoReplyService.instance) {
      AutoReplyService.instance = new AutoReplyService();
    }
    return AutoReplyService.instance;
  }

  /**
   * Verstuurt direct een bevestiging van ontvangst in het officile HTML template.
   */
  async sendInstantInvoiceConfirmation(options: {
    to: string, 
    subject: string, 
    originalBody: string, 
    firstName?: string, 
    language?: string, 
    accountId?: string,
    invoiceNumber?: string,
    amount?: number,
    companyName?: string,
    host?: string
  }): Promise<void> {
    const { to, subject, originalBody, firstName, language = 'nl-BE', invoiceNumber, amount, host } = options;
    
    //  Intelligence Layer: Haal markt-specifieke info op
    const market = MarketManager.getCurrentMarket(host);
    const accountId = options.accountId || market.email;
    const senderName = market.company_name === 'Voices' ? `Johfrah van ${market.name}` : market.company_name;

    console.log(` Instant HTML autoreply verzenden naar ${to} voor markt ${market.market_code}...`);

    try {
      const { VumeEngine } = await import('@/lib/mail/VumeEngine');
      
      await VumeEngine.send({
        to,
        from: `"${senderName}" <${accountId}>`,
        subject: `Re: ${subject}`,
        template: 'invoice-reply',
        context: {
          userName: firstName,
          invoiceNumber: invoiceNumber,
          amount: amount,
          language: language
        },
        host: host
      });

      console.log(` VUME HTML Template autoreply verzonden naar ${to}`);
    } catch (error) {
      console.error(' VUME HTML Template AutoReply Error:', error);
    }
  }

  /**
   * Genereert een concept-antwoord en plaatst dit in de Approval Queue.
   * (Oude methode behouden voor andere flows indien nodig)
   */
  async prepareInvoiceConfirmation(to: string, subject: string, originalBody: string, firstName?: string, language: string = 'nl-BE', accountId?: string, host?: string): Promise<void> {
    const market = MarketManager.getCurrentMarket(host);
    const finalAccountId = accountId || market.email;
    // ... bestaande logica ...
  }
}
