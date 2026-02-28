import { db, getTable } from '@/lib/system/voices-config';

const orders = getTable('orders');
const systemEvents = getTable('systemEvents');
import { eq } from "drizzle-orm";
import { InvoiceService } from "../commerce/invoice-service";
import { SmartmailService } from "./smartmail-service";

/**
 *  CORE AUTOMATION ENGINE (2026)
 * 
 * Het centrale brein dat events koppelt aan acties.
 * "Zero Laws" - Geen handmatige tussenkomst nodig.
 */

export type CoreEvent = 
  | 'order.paid'
  | 'order.delivered'
  | 'order.completed'
  | 'customer.overdue'
  | 'actor.availability_changed';

export class CoreAutomationEngine {
  /**
   * Het startpunt voor elk systeem-event.
   */
  static async trigger(event: CoreEvent, data: any) {
    console.log(`[Core ] Triggering event: ${event}`, data);

    // 1. Log event voor audit trail
    await db.insert(systemEvents).values({
      source: `core/${event}`,
      level: 'info',
      message: `Event: ${event}`,
      details: data
    });

    try {
      switch (event) {
        case 'order.paid':
          await this.handleOrderPaid(data.orderId);
          break;
        
        case 'order.completed':
          await this.handleOrderCompleted(data.orderId);
          break;

        case 'customer.overdue':
          await this.handleCustomerOverdue(data.customerId);
          break;

        default:
          console.warn(`[Core ] No handler for event: ${event}`);
      }
    } catch (error) {
      console.error(`[Core ] Error handling ${event}:`, error);
      await db.insert(systemEvents).values({
        source: `core/${event}`,
        level: 'critical',
        message: `FAILED: ${event}`,
        details: { error: String(error), data }
      });
    }
  }

  /**
   * Actie bij betaling: Start facturatie flow
   */
  private static async handleOrderPaid(orderId: number) {
    // Directe facturatie in Yuki via de InvoiceService
    const result = await InvoiceService.createInvoiceFromOrder(orderId);
    
    if (result.success) {
      // Trigger volgende stap: Bevestiging naar klant
      await this.trigger('order.completed', { orderId });
    }
  }

  /**
   * Actie bij voltooiing: Stuur slimme e-mail
   */
  private static async handleOrderCompleted(orderId: number) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return;

    // Trigger Smartmail voor levering
    // fetch(process.env.EMAIL_SERVICE_URL + '/send', { ... })
  }

  /**
   * Actie bij Churn-gevaar: Proactieve sales-mail
   */
  private static async handleCustomerOverdue(customerId: number) {
    const opportunities = await SmartmailService.getProactiveOpportunities();
    const opp = opportunities.find(o => o.customerId === customerId);
    
    if (opp && opp.confidence > 0.8) {
      await SmartmailService.queueSmartmail(opp);
      console.log(`[Core ] Proactive Smartmail queued for ${opp.email}`);
    }
  }
}
