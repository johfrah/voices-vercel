import { db, orders } from '@/lib/system/voices-config';
import { eq, inArray } from "drizzle-orm";

/**
 *  DOCUMENT PROCESSOR (NUCLEAR EDITION)
 * 
 * Doel: Het intelligent matchen van factuurtekst aan database orders.
 * Herkent patronen zoals VOICES-2026-XXXX en valideert bedragen.
 * 
 * UPDATE: Voegt ook contact- en IBAN-detectie toe voor mailbox intelligence.
 */

export interface MatchResult {
  matchedOrderIds: number[];
  totalMatchedAmount: number;
  confidence: number;
  discrepancies: string[];
}

export interface IntelligenceResult {
  iban?: string;
  email?: string;
  phone?: string;
  kvk?: string;
  btw?: string;
}

export class DocumentProcessor {
  private static ORDER_PATTERN = /VOICES-(\d{4})-(\d{4,6})/g;
  private static IBAN_PATTERN = /[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}/g;
  private static EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  private static PHONE_PATTERN = /(\+|00)[1-9][0-9 \-\(\)\.]{7,32}/g;

  /**
   * Scant de tekst van een factuur op ordernummers en valideert deze tegen de DB.
   */
  static async matchInvoiceToOrders(invoiceText: string, expectedTotal: number): Promise<MatchResult> {
    const matches = Array.from(invoiceText.matchAll(this.ORDER_PATTERN));
    const orderIds = matches.map(m => parseInt(m[2])); // We pakken het unieke volgnummer

    if (orderIds.length === 0) {
      return { matchedOrderIds: [], totalMatchedAmount: 0, confidence: 0, discrepancies: ['Geen ordernummers gevonden'] };
    }

    // 1. Haal de orders op uit de database
    const foundOrders = await db
      .select({
        id: orders.id,
        total: orders.total,
        status: orders.status
      })
      .from(orders)
      .where(inArray(orders.id, orderIds));

    const matchedIds = foundOrders.map(o => o.id);
    const totalAmount = foundOrders.reduce((acc: number, o: any) => acc + parseFloat(o.total || '0'), 0);

    // 2. Validatie logica
    const discrepancies: string[] = [];
    if (Math.abs(totalAmount - expectedTotal) > 0.01) {
      discrepancies.push(`Bedrag op factuur (${expectedTotal}) wijkt af van database totaal (${totalAmount})`);
    }

    const missingIds = orderIds.filter(id => !matchedIds.includes(id));
    if (missingIds.length > 0) {
      discrepancies.push(`Ordernummers niet gevonden in database: ${missingIds.join(', ')}`);
    }

    return {
      matchedOrderIds: matchedIds,
      totalMatchedAmount: totalAmount,
      confidence: matchedIds.length / orderIds.length,
      discrepancies
    };
  }

  /**
   * Koppel de goedgekeurde factuur aan de orders in de database.
   */
  static async linkInvoiceToOrders(yukiInvoiceId: string, orderIds: number[]) {
    // Update de order_items of orders met de referentie naar de Yuki aankoopfactuur
    // Dit zorgt ervoor dat we weten welke opdrachten betaald zijn via welke factuur.
    for (const id of orderIds) {
      await db.update(orders)
        .set({ 
          yukiInvoiceId: yukiInvoiceId, // We hergebruiken dit veld voor de aankoop-link
          status: 'completed' 
        })
        .where(eq(orders.id, id));
    }
  }

  /**
   *  EXTRACT INTELLIGENCE
   * Haalt nuttige data (IBAN, contactinfo) uit ruwe tekst.
   * Wordt gebruikt door de mailbox om kansen te spotten.
   */
  static extractIntelligence(text: string): IntelligenceResult {
    const ibanMatch = text.match(this.IBAN_PATTERN);
    const emailMatch = text.match(this.EMAIL_PATTERN);
    const phoneMatch = text.match(this.PHONE_PATTERN);

    return {
      iban: ibanMatch ? ibanMatch[0] : undefined,
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
    };
  }
}
