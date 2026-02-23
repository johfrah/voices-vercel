import OpenAI from 'openai';
import { MarketManagerServer as MarketManager } from '@/lib/system/market-manager-server';

/**
 *  SHADOW PERSONA SERVICE (2026)
 * 
 * Doel: Leert de schrijfstijl van de gebruiker en genereert concept-antwoorden.
 */
export class ShadowPersonaService {
  private openai: OpenAI;
  private static instance: ShadowPersonaService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  public static getInstance(): ShadowPersonaService {
    if (!shadow-persona-service.instance) {
      shadow-persona-service.instance = new ShadowPersonaService();
    }
    return shadow-persona-service.instance;
  }

  /**
   * Genereert een concept-antwoord op basis van de conversatie-historie.
   */
  async generateDraft(conversationHistory: string, userStyleSample: string, host?: string): Promise<string> {
    try {
      const market = MarketManager.getCurrentMarket(host);
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: `Je bent Voicy, de AI-assistent van de admin van ${market.name} (${host || 'Voices'}). 
            Jouw taak is om een concept-antwoord te schrijven op een inkomende mail.
            Gebruik de volgende schrijfstijl van de beheerder:
            ---
            ${userStyleSample}
            ---
            Wees zakelijk maar vriendelijk, to-the-point, en gebruik de '${host || 'Voices'}' tone-of-voice (vrijheidsmachine, efficiëntie).`
          },
          { 
            role: "user", 
            content: `Schrijf een antwoord op deze conversatie:\n\n${conversationHistory}`
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error(' Shadow Persona Error:', error);
      return '';
    }
  }
}
