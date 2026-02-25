import { db, actors } from '@/lib/system/voices-config';
import { eq, sql } from "drizzle-orm";
import { DbService } from "../services/db-service";

/**
 *  NUCLEAR AVAILABILITY SERVICE (2026)
 * 
 * Beheert de beschikbaarheid en vakanties van stemacteurs.
 * Vervangt de PHP Vacation Utilities.
 */

export interface AvailabilityStatus {
  isAvailable: boolean;
  reason?: string;
  until?: Date;
}

export class AvailabilityService {
  /**
   * Controleert of een acteur momenteel beschikbaar is.
   */
  static async getActorAvailability(actorId: number): Promise<AvailabilityStatus> {
    const [actor] = await db.select().from(actors).where(eq(actors.id, actorId));
    
    if (!actor) return { isAvailable: false, reason: 'Acteur niet gevonden' };

    // 1. Check expliciete status
    if (actor.status === 'unavailable') {
      return { isAvailable: false, reason: 'Tijdelijk niet beschikbaar' };
    }

    // 2. Check vakantie schema in JSONB
    const now = new Date();
    const availability = (actor.availability as any[]) || [];
    
    for (const period of availability) {
      const start = new Date(period.start);
      const end = new Date(period.end);
      
      if (now >= start && now <= end) {
        return { 
          isAvailable: false, 
          reason: period.reason || 'Vakantie', 
          until: end 
        };
      }
    }

    return { isAvailable: true };
  }

  /**
   * Berekent de verwachte leverdatum op basis van de acteur-configuratie.
   */
  static calculateExpectedDelivery(actorId: number, deliveryDays: number = 2): Date {
    const now = new Date();
    let deliveryDate = new Date(now);
    let daysToAdd = deliveryDays;

    while (daysToAdd > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Sla weekenden over (Zaterdag = 6, Zondag = 0)
      const day = deliveryDate.getDay();
      if (day !== 0 && day !== 6) {
        daysToAdd--;
      }
    }

    return deliveryDate;
  }

  /**
   * Zet een acteur op 'Vakantie' via DbService
   */
  static async setVacation(actorId: number, start: Date, end: Date, reason: string = 'Vakantie') {
    const [actor] = await db.select().from(actors).where(eq(actors.id, actorId));
    if (!actor) throw new Error('Acteur niet gevonden');

    const currentAvailability = (actor.availability as any[]) || [];
    const newAvailability = [...currentAvailability, { start: start.toISOString(), end: end.toISOString(), reason }];

    return await DbService.updateRecord(actors, actorId, {
      availability: newAvailability,
      status: 'unavailable' // Optioneel: direct op unavailable zetten
    });
  }
}
