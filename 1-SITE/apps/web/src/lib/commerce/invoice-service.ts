import { db, orderItems, orders, users } from '@/lib/system/db';
import { eq } from "drizzle-orm";
import { DbService } from "../services/db-service";

/**
 *  INVOICE SERVICE (2026)
 * 
 * Verantwoordelijk voor het genereren van facturen en synchronisatie met Yuki.
 */

export interface InvoiceData {
  orderId: number;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    tax: number;
  }>;
  total: number;
  tax: number;
  currency: string;
  vatNumber?: string;
}

export class InvoiceService {
  /**
   * Genereert een factuur voor een specifieke order.
   */
  static async createInvoiceFromOrder(orderId: number) {
    console.log(` Generating Invoice for Order #${orderId}...`);

    try {
      // 1. Haal de order en items op
      const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error(`Order #${orderId} niet gevonden.`);

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      
      const [user] = order.userId 
        ? await db.select().from(users).where(eq(users.id, order.userId))
        : [null];

      // 2. Bereid de factuurdata voor (Peppol-ready)
      const invoiceData: InvoiceData = {
        orderId: order.id,
        customerEmail: user?.email || (order.rawMeta as any)?.billing_email || '',
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          price: parseFloat(item.price || '0'),
          tax: parseFloat(item.tax || '0'),
        })),
        total: parseFloat(order.total || '0'),
        tax: parseFloat(order.tax || '0'),
        currency: 'EUR',
        vatNumber: order.billingVatNumber || user?.vatNumber || undefined,
      };

      // 3. Simuleer Yuki API Call (In productie wordt dit een echte Peppol/Yuki push)
      const yukiResponse = await this.pushToYuki(invoiceData);

      // 4. Update de order met factuurgegevens via DbService
      await DbService.updateRecord(orders, orderId, {
        yukiInvoiceId: yukiResponse.invoiceId,
        status: 'completed',
        rawMeta: {
          ...(order.rawMeta as any || {}),
          yuki_pushed: true,
          yuki_invoice_number: yukiResponse.invoiceNumber,
          invoice_date: new Date().toISOString(),
        }
      });

      console.log(` Invoice #${yukiResponse.invoiceNumber} created and synced to Yuki.`);
      
      return {
        success: true,
        invoiceId: yukiResponse.invoiceId,
        invoiceNumber: yukiResponse.invoiceNumber
      };

    } catch (error) {
      console.error(` Invoice Generation Failed for Order #${orderId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Push data naar Yuki API (Peppol-ready)
   */
  private static async pushToYuki(data: InvoiceData) {
    // Hier komt de echte SOAP/REST koppeling met Yuki via de Yuki SDK
    // Voor nu retourneren we een placeholder die aangeeft dat de koppeling actief is
    // maar we vermijden random mock data.
    const response = await fetch(`${process.env.YUKI_API_URL}/invoice`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.YUKI_API_KEY}` },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Yuki Sync Failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
