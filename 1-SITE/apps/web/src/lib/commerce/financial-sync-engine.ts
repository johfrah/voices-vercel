import { YukiInboundMonitor } from "./yuki-inbound-monitor";
import { DocumentProcessor } from "../intelligence/document-processor";
import { CoreAutomationEngine } from "../system/core-automation-engine";
import { db, systemEvents } from '@/lib/system/db';

/**
 *  FINANCIAL SYNC ENGINE (2026)
 * 
 * De lijm tussen Yuki goedkeuringen en de Voices administratie.
 * Draait periodiek om de acties van de boekhouder te verwerken.
 */

export class FinancialSyncEngine {
  /**
   * Hoofdproces voor het synchroniseren van goedgekeurde aankoopfacturen.
   * "Direct Match" Edition: Wacht niet op de boekhouder, maar match op document-niveau.
   */
  static async syncApprovedInvoices() {
    console.log('[Financial Sync]  Starting Direct Match sync with Yuki...');

    try {
      // 1. Haal alle nieuwe aankoopfacturen op (niet alleen de goedgekeurde)
      const newInvoices = await YukiInboundMonitor.getApprovedInvoices(); // Nu ook 'Pending' documenten
      
      for (const inv of newInvoices) {
        // 2. Probeer te matchen aan orders via AI/Pattern matching
        const invoiceText = `Factuur voor orders VOICES-2026-${inv.invoiceNumber}`; 
        const match = await DocumentProcessor.matchInvoiceToOrders(invoiceText, inv.totalAmount);

        // 3. "Direct Match" Logic: Bij een sterke match (confidence > 0.8), 
        // maken we de payout direct beschikbaar, ongeacht de status in Yuki.
        if (match.confidence > 0.8) {
          await DocumentProcessor.linkInvoiceToOrders(inv.id, match.matchedOrderIds);
          
          await db.insert(systemEvents).values({
            source: 'sync/financial',
            level: 'info',
            message: `Direct Match: Factuur ${inv.invoiceNumber} (Status: ${inv.status}) direct gekoppeld aan ${match.matchedOrderIds.length} orders.`,
            details: { yukiId: inv.id, orderIds: match.matchedOrderIds, speedMatch: true }
          });

          // Trigger Ponto Payout flow (maak direct beschikbaar in dashboard)
          await CoreAutomationEngine.trigger('order.completed', { orderIds: match.matchedOrderIds });
        }
      }
      console.log('[Financial Sync]  Direct Match sync completed.');
    } catch (error) {
      console.error('[Financial Sync Error]:', error);
    }
  }
}
