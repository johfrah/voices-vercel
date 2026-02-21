import { db } from "@db";
import { orders, orderItems, systemEvents } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { DbService } from "../db-service";
import crypto from "crypto";

/**
 *  NUCLEAR RESCHEDULE SERVICE (2026)
 * 
 * Beheert het verplaatsen van afspraken en workshops via veilige tokens.
 * Vervangt de PHP Workshop Reschedule Endpoint en Appointment System.
 */

export interface ReschedulePayload {
  orderId: number;
  newSlot?: string;
  scope: 'workshop' | 'appointment';
  exp: number;
  jti: string;
}

export class RescheduleService {
  private static SECRET = process.env.RESCHEDULE_SECRET || 'voices_nuclear_reschedule_2026';

  /**
   * Genereert een veilige, gesigneerde link voor het verplaatsen van een afspraak.
   */
  static generateRescheduleLink(orderId: number, scope: 'workshop' | 'appointment' = 'workshop'): string {
    const jti = crypto.randomBytes(16).toString('hex');
    const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 dagen geldig

    const payload: ReschedulePayload = { orderId, scope, exp, jti };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(payloadBase64)
      .digest('base64url');

    return `/studio/reschedule?p=${payloadBase64}&s=${signature}`;
  }

  /**
   * Verifieert een reschedule token.
   */
  static verifyToken(payloadBase64: string, signature: string): ReschedulePayload | null {
    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET)
      .update(payloadBase64)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    try {
      const payload: ReschedulePayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
      
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;
      
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Voert de daadwerkelijke verplaatsing uit via DbService.
   */
  static async applyReschedule(orderId: number, newDate: Date, note?: string) {
    console.log(` Rescheduling Order #${orderId} to ${newDate.toISOString()}...`);

    return await db.transaction(async (tx) => {
      // 1. Update de order met de nieuwe datum
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
      if (!order) throw new Error('Order niet gevonden');

      await DbService.updateRecord(orders, orderId, {
        expectedDeliveryDate: newDate,
        internalNotes: note ? `${order.internalNotes || ''}\n[Reschedule]: ${note}` : order.internalNotes,
        status: 'processing' // Reset status indien nodig
      });

      // 2. Log de systeem-event
      await tx.insert(systemEvents).values({
        source: 'reschedule_service',
        level: 'info',
        message: `Order #${orderId} verplaatst naar ${newDate.toLocaleDateString()}`,
        details: { orderId, newDate: newDate.toISOString() }
      });

      return { success: true, newDate };
    });
  }

  /**
   * Slaat poll-voorkeuren op voor een gebruiker.
   */
  static async savePollChoices(orderId: number, choices: string[]) {
    return await DbService.updateRecord(orders, orderId, {
      rawMeta: {
        // @ts-ignore
        ...orders.rawMeta,
        reschedule_poll_choices: choices,
        reschedule_poll_at: new Date().toISOString()
      }
    });
  }
}
