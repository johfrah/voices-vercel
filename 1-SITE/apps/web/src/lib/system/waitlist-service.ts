import { db } from "@db";
import { workshopInterest, workshops, systemEvents } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { DbService } from "../DbService";

/**
 *  NUCLEAR WAITLIST SERVICE (2026)
 * 
 * Beheert de wachtlijst en genteresseerden voor workshops.
 * Vervangt de PHP Workshop Waitlist en Interest functions.
 */

export interface InterestRegistration {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  workshopIds: number[];
  sourceUrl?: string;
}

export class WaitlistService {
  /**
   * Registreert interesse voor een workshop.
   */
  static async registerInterest(data: InterestRegistration) {
    console.log(` Registering interest for ${data.email}...`);

    return await db.transaction(async (tx) => {
      // 1. Maak de registratie aan via DbService (simulatie)
      const [result] = await tx.insert(workshopInterest).values({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        productIds: data.workshopIds.join(','),
        sourceUrl: data.sourceUrl,
        status: 'pending'
      }).returning();

      // 2. Log de event
      await tx.insert(systemEvents).values({
        source: 'waitlist_service',
        level: 'info',
        message: `Nieuwe interesse van ${data.email} voor workshops: ${data.workshopIds.join(', ')}`,
        details: { interestId: result.id }
      });

      return result;
    });
  }

  /**
   * Haalt de huidige status van een workshop op (beschikbare plaatsen).
   */
  static async getWorkshopStatus(workshopId: number) {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.id, workshopId));
    if (!workshop) return null;

    // In een echte scenario zouden we hier de orders tellen
    const currentParticipants = 5; // Simulatie
    const remainingSeats = (workshop.capacity || 8) - currentParticipants;

    return {
      totalCapacity: workshop.capacity,
      remainingSeats,
      isFull: remainingSeats <= 0
    };
  }
}
