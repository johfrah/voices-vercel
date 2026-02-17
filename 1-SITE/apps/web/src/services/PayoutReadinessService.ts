import { and, eq } from 'drizzle-orm';
import { db } from '@db';
import { approvalQueue, orderItems, vaultFiles } from '@db/schema';

/**
 *  PAYOUT READINESS SERVICE (NUCLEAR 2026)
 * 
 * Verantwoordelijk voor de "Closed-Loop" validatie:
 * Alleen als de klant heeft goedgekeurd n de factuur is binnen,
 * wordt de betaling klaargezet voor Ponto.
 */
export class PayoutReadinessService {
  private static instance: PayoutReadinessService;

  public static getInstance(): PayoutReadinessService {
    if (!PayoutReadinessService.instance) {
      PayoutReadinessService.instance = new PayoutReadinessService();
    }
    return PayoutReadinessService.instance;
  }

  /**
   * Controleert of een specifieke opdracht (order_item) klaar is voor uitbetaling.
   * Wordt getriggerd door:
   * 1. Klant die audio goedkeurt (Client Portal)
   * 2. Engine die een factuur matcht (Mailbox Sync)
   */
  async checkAndPreparePayout(orderItemId: number): Promise<boolean> {
    console.log(` Payout Check voor Order Item ${orderItemId}...`);

    // 1. Haal de opdracht en bijbehorende data op
    const item = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, orderItemId),
      with: {
        order: {
          with: {
            user: true
          }
        } as any,
        actor: {
          with: {
            user: true
          }
        } as any
      }
    });

    if (!item) {
      console.log(`    Order Item niet gevonden.`);
      return false;
    }

    //  Filter: Alleen voor Agency orders (voice-overs)
    if ((item.order as any)?.journey !== 'agency') {
      console.log(`    Geen Payout nodig: Order behoort tot journey '${(item.order as any)?.journey}'.`);
      return false;
    }

    // 2. Check Klant Approval
    const isClientApproved = item.deliveryStatus === 'approved';
    
    // 3. Check of Factuur binnen is (in de Vault)
    const invoice = await db.query.vaultFiles.findFirst({
      where: and(
        eq(vaultFiles.category, 'invoice'),
        eq(vaultFiles.actorId, item.actorId!)
        // We zouden hier ook op Order ID kunnen matchen als we dat in de metadata hebben
      )
    });

    const hasInvoice = !!invoice;

    console.log(`    Klant Approved: ${isClientApproved ? '' : ''}`);
    console.log(`    Factuur Binnen: ${hasInvoice ? '' : ''}`);

    if (isClientApproved && hasInvoice) {
      console.log(`    PONTO-READY! Betaling voorbereiden...`);
      
      const actor = item.actor as any;

      // 4. Zet in de Approval Queue voor Ponto
      await db.insert(approvalQueue).values({
        type: 'payment',
        priority: 'normal',
        status: 'pending',
        reasoning: `Automatische match: Klant heeft audio goedgekeurd voor Order ${(item.order as any)?.wpOrderId || item.orderId} en factuur van ${actor?.firstName} is ontvangen.`,
        iapContext: {
          orderId: item.orderId,
          actorId: item.actorId,
          orderItemId: item.id
        },
        payload: {
          amount: parseFloat(item.cost || "0"),
          recipient_iban: actor?.user?.iban,
          recipient_name: `${actor?.firstName || ''} ${actor?.lastName || ''}`,
          reference: `VOICES-ORDER-${(item.order as any)?.wpOrderId || item.orderId}-${actor?.firstName || ''}`,
          order_id: item.orderId,
          order_item_id: item.id,
          invoice_vault_id: invoice.id
        },
        targetId: item.id.toString()
      });

      return true;
    }

    return false;
  }
}
