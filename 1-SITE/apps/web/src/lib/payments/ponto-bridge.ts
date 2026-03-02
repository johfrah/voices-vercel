import { db, getTable } from '@/lib/system/voices-config';
const orders = getTable('orders');
const users = getTable('users');
const approvalQueue = getTable('approvalQueue');
import { eq, inArray, sql } from "drizzle-orm";

/**
 *  PONTO BRIDGE (NUCLEAR EDITION 2026)
 * 
 * Verantwoordelijk voor de directe communicatie met de Ponto API (Ibanity).
 * Handelt Payment Initiation en Account Information af.
 */

export interface PayoutRecipient {
  iban: string;
  name: string;
  amount: number;
  reference: string;
  orderId?: number;
}

export class PontoBridge {
  private static API_BASE = 'https://api.ibanity.com/ponto-connect';
  private static CLIENT_ID = process.env.PONTO_CLIENT_ID;
  private static CLIENT_SECRET = process.env.PONTO_CLIENT_SECRET;

  /**
   *  BANK RECONCILIATION: Haalt banktransacties op via Ponto
   * voor automatische aflettering in Yuki.
   */
  static async getTransactions(accountId: string, fromDate: string) {
    const token = await this.getAccessToken();
    const response = await fetch(`${this.API_BASE}/accounts/${accountId}/transactions?filter[createdAt][from]=${fromDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch Ponto transactions');
    return await response.json();
  }

  /**
   *  ATOMIC HITL: Stelt een betaling voor aan de Approval Queue.
   * Voicy doet het voorwerk, jij doet de regie.
   */
  static async suggestPayout(recipient: PayoutRecipient, reasoning: string) {
    console.log(` [Ponto HITL] Suggesting payout for ${recipient.name}: ${recipient.amount}`);

    await db.insert(approvalQueue).values({
      type: 'payment',
      priority: 'high',
      reasoning: reasoning,
      payload: {
        amount: recipient.amount,
        recipient_iban: recipient.iban,
        recipient_name: recipient.name,
        reference: recipient.reference,
        order_id: recipient.orderId
      },
      targetId: recipient.orderId?.toString()
    });

    return { success: true, message: 'Payout suggested and waiting for approval' };
  }

  /**
   * Creert een bulk-betaling (Payment Initiation) in Ponto.
   * Dit zet de betalingen klaar voor jouw finale akkoord in de bank-app.
   * WORDT PAS AANGEROEPEN NA JOUW APPROVAL IN HET DASHBOARD.
   */
  static async executeApprovedPayout(approvalId: number) {
    const [approval] = await db.select().from(approvalQueue).where(eq(approvalQueue.id, approvalId));
    
    if (!approval || approval.status !== 'approved') {
      throw new Error('Action not approved for execution');
    }

    const payload = approval.payload as any;
    const recipients: PayoutRecipient[] = [{
      iban: payload.recipient_iban,
      name: payload.recipient_name,
      amount: payload.amount,
      reference: payload.reference
    }];

    return await this.createBulkPayment(recipients);
  }

  static async createBulkPayment(recipients: PayoutRecipient[]) {
    // ... bestaande createBulkPayment logica ...
    console.log(`[Ponto ] Initiating bulk payment for ${recipients.length} recipients...`);

    try {
      // 1. Verkrijg Access Token
      const token = await this.getAccessToken();

      // 2. Bouw de Ponto Payment Request
      // Ponto gebruikt de Ibanity API-structuur
      const paymentRequest = {
        data: {
          type: "paymentRequests",
          attributes: {
            batchBookingPreferred: true,
            payments: recipients.map(r => ({
              amount: r.amount,
              currency: "EUR",
              remittanceInformation: r.reference,
              remittanceInformationType: "unstructured",
              creditorName: r.name,
              creditorAccountIban: r.iban
            }))
          }
        }
      };

      // 3. Verstuur naar Ponto
      const response = await fetch(`${this.API_BASE}/payment-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Ponto API Error: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        paymentRequestId: result.data.id,
        redirectUrl: result.data.links.redirect // De URL waar jij de batch tekent
      };

    } catch (error) {
      console.error('[Ponto Bridge Error]:', error);
      throw error;
    }
  }

  /**
   * Haalt alle goedgekeurde orders op die klaarstaan voor uitbetaling.
   */
  static async getPendingPayouts() {
    // We zoeken orders die gekoppeld zijn aan een Yuki-factuur maar nog niet betaald zijn via Ponto
    const pendingOrders = await db
      .select({
        orderId: orders.id,
        total: orders.total,
        user_id: orders.user_id,
        yukiInvoiceId: orders.yukiInvoiceId
      })
      .from(orders)
      .where(sql`${orders.yukiInvoiceId} IS NOT NULL AND ${orders.status} = 'completed'`);

    if (pendingOrders.length === 0) return [];

    // Haal de IBANs van de acteurs op
    const userIds = pendingOrders.map((o: any) => o.user_id).filter(Boolean) as number[];
    const actors = await db.select().from(users).where(inArray(users.id, userIds));

    return pendingOrders.map((order: any) => {
      const actor = actors.find((a: any) => a.id === order.user_id);
      return {
        orderId: order.orderId,
        amount: parseFloat(order.total || '0'),
        name: `${actor?.first_name} ${actor?.last_name}`,
        iban: (actor as any)?.iban || '',
        reference: `VOICES-PAYOUT-${order.orderId}`
      };
    });
  }

  private static async getAccessToken(): Promise<string> {
    // OAuth2 flow voor Ponto
    // fetch('https://api.ibanity.com/oauth/token', { ... })
    return "MOCK_PONTO_TOKEN";
  }
}
