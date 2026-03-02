import { db, orderItems, orders } from '@/lib/system/voices-config';
import { and, desc, eq, sql } from 'drizzle-orm';

/**
 *  VOICY PATTERN ENGINE (NUCLEAR EDITION 2026)
 * 
 * Deze service vervangt de PHP Pattern Engine logica.
 * Het analyseert order-historie om terugkerende patronen te detecteren
 * en toekomstige behoeften te voorspellen voor de "Systeem-kern".
 */

export interface PatternResult {
  avgIntervalDays: number;
  lastOrderDate: Date;
  daysSinceLast: number;
  expectedInDays: number;
  isOverdue: boolean;
  confidence: number;
}

export class VoicyPatternEngine {
  /**
   * Analyseert de order-historie van een klant voor terugkerende patronen.
   */
  static async analyzeCustomerPatterns(user_id: number) {
    // 1. Haal alle succesvolle orders op voor deze gebruiker
    const userOrders = await db.select()
      .from(orders)
      .where(and(
        eq(orders.user_id, userId),
        sql`${orders.status} IN ('completed', 'processing')`
      ))
      .orderBy(desc(orders.createdAt));

    if (userOrders.length < 2) {
      return { hasPattern: false, reason: 'Onvoldoende order historie' };
    }

    // 2. Haal alle items op voor deze orders om categorien te mappen
    const orderIds = userOrders.map(o => o.id);
    const items = await db.select()
      .from(orderItems)
      .where(sql`${orderItems.orderId} IN ${orderIds}`);

    const categoryIntervals: Record<string, number[]> = {};

    // Map timestamps per journey/categorie
    for (const order of userOrders) {
      const timestamp = order.createdAt?.getTime() || 0;
      const journey = order.journey;

      if (!categoryIntervals[journey]) {
        categoryIntervals[journey] = [];
      }
      categoryIntervals[journey].push(timestamp);
    }

    const results: Record<string, PatternResult> = {};
    const now = Date.now();

    for (const [journey, timestamps] of Object.entries(categoryIntervals)) {
      if (timestamps.length < 2) continue;

      // Sorteer van oud naar nieuw voor interval berekening
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      const intervals: number[] = [];

      for (let i = 1; i < sortedTimestamps.length; i++) {
        const diffDays = (sortedTimestamps[i] - sortedTimestamps[i - 1]) / (1000 * 60 * 60 * 24);
        intervals.push(diffDays);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const lastOrderTimestamp = sortedTimestamps[sortedTimestamps.length - 1];
      const daysSinceLast = (now - lastOrderTimestamp) / (1000 * 60 * 60 * 24);
      const expectedInDays = avgInterval - daysSinceLast;

      results[journey] = {
        avgIntervalDays: Math.round(avgInterval * 10) / 10,
        lastOrderDate: new Date(lastOrderTimestamp),
        daysSinceLast: Math.round(daysSinceLast * 10) / 10,
        expectedInDays: Math.round(expectedInDays * 10) / 10,
        isOverdue: expectedInDays < 0,
        confidence: this.calculateConfidence(intervals)
      };
    }

    return {
      hasPattern: Object.keys(results).length > 0,
      patterns: results,
      analyzedAt: new Date()
    };
  }

  /**
   * Berekent de betrouwbaarheidsscore op basis van interval consistentie.
   */
  private static calculateConfidence(intervals: number[]): number {
    if (intervals.length < 2) return 0.5;

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + pow(b - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    const cv = stdDev / (avg || 1.0);
    const confidence = Math.max(0.0, 1.0 - cv);

    return Math.round(confidence * 100) / 100;
  }
}

function pow(base: number, exp: number): number {
  return Math.pow(base, exp);
}
