import { GeminiService } from './gemini-service';
import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

/**
 *  SHADOW PERSONA SERVICE (2026)
 * 
 * Doel: Leert de schrijfstijl van de gebruiker en genereert concept-antwoorden.
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini (v2.16.104)
 */
export class ShadowPersonaService {
  private gemini: GeminiService;
  private static instance: ShadowPersonaService;

  constructor() {
    this.gemini = GeminiService.getInstance();
  }

  public static getInstance(): ShadowPersonaService {
    if (!ShadowPersonaService.instance) {
      ShadowPersonaService.instance = new ShadowPersonaService();
    }
    return ShadowPersonaService.instance;
  }

  /**
   * Genereert een concept-antwoord op basis van de conversatie-historie via Gemini.
   */
  async generateDraft(conversationHistory: string, userStyleSample: string, host?: string): Promise<string> {
    try {
      const market = MarketManager.getCurrentMarket(host);
      const prompt = `
        Je bent Voicy, de AI-assistent van de admin van ${market.name} (${host || 'Voices'}). 
        Jouw taak is om een concept-antwoord te schrijven op een inkomende mail.
        Gebruik de volgende schrijfstijl van de beheerder:
        ---
        ${userStyleSample}
        ---
        Wees zakelijk maar vriendelijk, to-the-point, en gebruik de '${host || 'Voices'}' tone-of-voice (vrijheidsmachine, efficiëntie).

        CONVERSATIE HISTORIE:
        ${conversationHistory}
      `;

      return await this.gemini.generateText(prompt);
    } catch (error) {
      console.error(' Shadow Persona Error:', error);
      return '';
    }
  }
}
