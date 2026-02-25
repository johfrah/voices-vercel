import { db, orders, orderItems, workshops, users } from '@/lib/system/voices-config';
import { eq, and } from "drizzle-orm";

/**
 *  NUCLEAR CERTIFICATE SERVICE (2026)
 * 
 * Beheert de generatie en validatie van workshop certificaten.
 * Vervangt de PHP Workshop Certificate Generator.
 */

export interface CertificateData {
  participantName: string;
  workshopTitle: string;
  instructorName: string;
  date: Date;
  orderId: number;
}

export class CertificateService {
  /**
   * Valideert of een certificaat gegenereerd mag worden voor een order item.
   */
  static async validateEligibility(orderId: number, itemId: number): Promise<boolean> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order || order.status !== 'completed') return false;

    const [item] = await db.select().from(orderItems).where(and(
      eq(orderItems.id, itemId),
      eq(orderItems.orderId, orderId)
    ));

    if (!item) return false;

    // Check of het een workshop product is (via journey)
    return order.journey === 'studio' || order.journey === 'academy';
  }

  /**
   * Genereert de data voor een certificaat.
   */
  static async getCertificateData(orderId: number, itemId: number): Promise<CertificateData | null> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    const [item] = await db.select().from(orderItems).where(eq(orderItems.id, itemId));
    const [user] = order?.user_id ? await db.select().from(users).where(eq(users.id, order.user_id)) : [null];

    if (!order || !item) return null;

    return {
      participantName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || (order.rawMeta as any)?.billing_first_name || 'Deelnemer',
      workshopTitle: item.name,
      instructorName: 'Voices Studio', // Wordt dynamisch via workshop tabel
      date: order.createdAt || new Date(),
      orderId: order.id
    };
  }

  /**
   * Genereert een PDF certificaat (API Call).
   */
  static async generatePdf(data: CertificateData): Promise<string> {
    console.log(` Generating PDF Certificate for ${data.participantName}...`);
    
    // CHRIS-PROTOCOL: Nuclear PDF Generation (v2.14.520)
    // We use a specialized OG-based generator that flattens the certificate to a high-res image/PDF.
    // The URL structure is: /api/certificates/render?orderId=...&name=...&workshop=...&date=...
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voices.be';
    const params = new URLSearchParams({
        name: data.participantName,
        workshop: data.workshopTitle,
        instructor: data.instructorName,
        date: data.date.toISOString().split('T')[0],
        orderId: data.orderId.toString()
    });

    return `${baseUrl}/api/certificates/render?${params.toString()}`;
  }
}
