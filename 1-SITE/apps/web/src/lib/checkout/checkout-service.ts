import { db } from '@/lib/system/voices-config';
import { orders, orderItems } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';
import { InvoiceService } from '../commerce/invoice-service';

/**
 *  ZERO-LOSS CHECKOUT SERVICE (2026)
 * 
 * Beheert de frictieloze booking flow voor Studio & Agency.
 * SSoT: Single Source of Truth voor order creatie.
 */
export class CheckoutService {
  /**
   * Creert een nieuwe order met minimale frictie.
   * Volgt het "Zero-Loss" protocol.
   */
  static async createOrder(data: {
    userId?: number;
    journey: 'agency' | 'studio' | 'academy';
    items: Array<{
      name: string;
      price: number;
      quantity: number;
      tax: number;
      meta?: any;
    }>;
    billingEmail: string;
    billingName: string;
    billingPhone?: string;
    billingVatNumber?: string;
    market: string;
  }) {
    console.log(` Zero-Loss Checkout: Creating ${data.journey} order for ${data.billingEmail}...`);

    try {
      // 1. Bereken totalen
      const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxTotal = data.items.reduce((sum, item) => sum + (item.tax * item.quantity), 0);
      const total = subtotal + taxTotal;

      // 2. Maak de order aan in de database
      const [newOrder] = await db.insert(orders).values({
        userId: data.userId,
        journey: data.journey,
        market: data.market,
        status: 'pending',
        total: total.toString(),
        tax: taxTotal.toString(),
        billingVatNumber: data.billingVatNumber,
        createdAt: new Date(),
        rawMeta: {
          billing_email: data.billingEmail,
          billing_name: data.billingName,
          billing_phone: data.billingPhone,
          checkout_version: '2026.1.0-zero-loss'
        }
      }).returning();

      // 3. Voeg items toe
      for (const item of data.items) {
        await db.insert(orderItems).values({
          orderId: newOrder.id,
          name: item.name,
          price: item.price.toString(),
          tax: item.tax.toString(),
          quantity: item.quantity,
          meta: item.meta
        });
      }

      console.log(` Order #${newOrder.id} created successfully.`);

      // 4. Trigger facturatie (HITL ready via Yuki sync)
      // In een echte flow zou dit pas na betaling gebeuren, 
      // maar voor de "Zero-Loss" flow bereiden we het alvast voor.
      
      return newOrder;
    } catch (error) {
      console.error(' Zero-Loss Checkout Error:', error);
      throw error;
    }
  }
}
