import { GeminiService } from './gemini-service';
import { db } from '@/lib/system/voices-config';
import { users } from '@/lib/system/voices-config';
import { eq } from 'drizzle-orm';

/**
 *  CONTACT ENRICHMENT SERVICE (2026)
 * 
 * Doel: Destilleert adresgegevens uit mail-handtekeningen en koppelt avatars.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export class ContactEnrichmentService {
  private gemini: GeminiService;
  private static instance: ContactEnrichmentService;

  constructor() {
    this.gemini = GeminiService.getInstance();
  }

  public static getInstance(): ContactEnrichmentService {
    if (!ContactEnrichmentService.instance) {
      ContactEnrichmentService.instance = new ContactEnrichmentService();
    }
    return ContactEnrichmentService.instance;
  }

  /**
   * Scant de tekst van een mail op zoek naar contactgegevens via Gemini.
   */
  async enrichFromText(userId: number, text: string): Promise<void> {
    if (!text || text.length < 50) return;

    try {
      // We pakken alleen de laatste 1000 tekens (waar de handtekening meestal zit)
      const signaturePart = text.substring(Math.max(0, text.length - 1000));

      const prompt = `
        Je bent een data-extractie expert. Extraheer contactgegevens uit de volgende email handtekening. 
        Geef ALLEEN een JSON object terug met de volgende velden (indien gevonden): 
        companyName, phone, addressStreet, addressZip, addressCity, addressCountry, vatNumber, website, linkedin.
        Als een veld niet gevonden is, laat het dan weg.

        HANDTEKENING:
        ${signaturePart}
      `;

      const response = await this.gemini.generateText(prompt, { jsonMode: true });
      const extractedData = JSON.parse(response);

      if (Object.keys(extractedData).length > 0) {
        console.log(`    AI heeft gegevens gedestilleerd voor user ${userId}:`, extractedData);
        
        await db.update(users)
          .set({
            ...extractedData,
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }
    } catch (error) {
      console.error(' Contact Enrichment Error:', error);
    }
  }
}
