import OpenAI from 'openai';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

/**
 *  CONTACT ENRICHMENT SERVICE (2026)
 * 
 * Doel: Destilleert adresgegevens uit mail-handtekeningen en koppelt avatars.
 */
export class ContactEnrichmentService {
  private openai: OpenAI;
  private static instance: ContactEnrichmentService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  public static getInstance(): ContactEnrichmentService {
    if (!ContactEnrichmentService.instance) {
      ContactEnrichmentService.instance = new ContactEnrichmentService();
    }
    return ContactEnrichmentService.instance;
  }

  /**
   * Scant de tekst van een mail op zoek naar contactgegevens.
   */
  async enrichFromText(userId: number, text: string): Promise<void> {
    if (!text || text.length < 50) return;

    try {
      // We pakken alleen de laatste 1000 tekens (waar de handtekening meestal zit)
      const signaturePart = text.substring(Math.max(0, text.length - 1000));

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: `Je bent een data-extractie expert. Extraheer contactgegevens uit de volgende email handtekening. 
            Geef ALLEEN een JSON object terug met de volgende velden (indien gevonden): 
            companyName, phone, addressStreet, addressZip, addressCity, addressCountry, vatNumber, website, linkedin.
            Als een veld niet gevonden is, laat het dan weg.`
          },
          { role: "user", content: signaturePart }
        ],
        response_format: { type: "json_object" },
        temperature: 0,
      });

      const extractedData = JSON.parse(response.choices[0].message.content || '{}');

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
