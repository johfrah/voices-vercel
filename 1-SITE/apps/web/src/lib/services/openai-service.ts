import { GeminiService } from "./gemini-service";

/**
 *  OPENAI INTELLIGENCE SERVICE (2026)
 * 
 * 🛡️ CHRIS-PROTOCOL: Deze service is nu een PROXY naar GeminiService (v2.16.104).
 * Dit stelt ons in staat om het OpenAI abonnement op te zeggen zonder alle imports te breken.
 */
export class OpenAIService {
  private static instance: OpenAIService;

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Genereert platte tekst via Gemini (voorheen OpenAI).
   */
  async generateText(prompt: string, model?: string, lang?: string): Promise<string> {
    try {
      // We negeren het 'model' argument en gebruiken altijd Gemini
      return await GeminiService.generateText(prompt, { lang });
    } catch (error: any) {
      console.error(' Gemini Proxy Error:', error);
      throw error;
    }
  }

  /**
   * Static shortcut voor generateText.
   */
  static async generateText(prompt: string, model?: string, lang?: string): Promise<string> {
    return OpenAIService.getInstance().generateText(prompt, model, lang);
  }
}
