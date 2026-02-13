import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 🧠 GEMINI INTELLIGENCE SERVICE (2026)
 * 
 * Doel: Snelle, bulk-analyse van mails op sentiment, intentie en klant-DNA.
 * Gebruikt Google Gemini 1.5 Flash voor optimale snelheid/kosten ratio.
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private static instance: GeminiService;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Helper om het model op te halen met de juiste v1beta compatibiliteit
   */
  private getModel() {
    // 🚀 GEMINI 2026 UPGRADE: Gebruik gemini-1.5-flash voor maximale stabiliteit
    // Fallback naar gemini-flash-latest voor maximale stabiliteit
    return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Genereert platte tekst via Gemini. Gebruikt door heal-routes, chat en Telegram-Bob.
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const model = this.getModel();
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('❌ Gemini Text Generation Error:', error);
      
      // Chris-Protocol: Geef een feitelijke fallback terug bij build-time errors of API issues
      if (error.message?.includes('403') || error.message?.includes('404')) {
        return "Ik heb momenteel moeite om verbinding te maken met mijn AI-motor. Probeer het later nog eens.";
      }
      
      return "Er is een fout opgetreden bij het genereren van de tekst.";
    }
  }

  /**
   * Static shortcut voor generateText (compat met heal-routes).
   */
  static async generateText(prompt: string): Promise<string> {
    return GeminiService.getInstance().generateText(prompt);
  }

  /**
   * Analyseert een mail en geeft gestructureerde AI data terug.
   */
  async analyzeMail(subject: string, body: string) {
    try {
      const model = this.getModel();

      const prompt = `
        Analyseer de volgende e-mail voor een voice-over bureau (Voices.be).
        Geef het resultaat terug in strikt JSON formaat.

        Onderwerp: ${subject}
        Inhoud: ${body.substring(0, 5000)}

        JSON structuur:
        {
          "sentiment": "positive" | "neutral" | "negative",
          "intent": "order" | "quote_request" | "complaint" | "info" | "other",
          "urgency": 0-1,
          "summary": "Korte samenvatting in 1 zin",
          "customer_needs": ["behoefte 1", "behoefte 2"],
          "suggested_action": "Wat moet Johfrah doen?"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean JSON from potential markdown fences
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('❌ Gemini Analysis Error:', error);
      return {
        sentiment: 'neutral',
        intent: 'other',
        urgency: 0.5,
        summary: 'Analyse mislukt',
        customer_needs: [],
        suggested_action: 'Handmatig controleren'
      };
    }
  }

  /**
   * Analyseert een afbeelding en geeft een vision beschrijving terug.
   * Nu met extra context (metadata, bestandsnaam, etc.) voor diepere intelligentie.
   */
  async analyzeImage(imageBuffer: Buffer, mimeType: string, context?: any) {
    try {
      const model = this.getModel();

      const contextPrompt = context ? `
        Aanvullende context over deze afbeelding:
        - Bestandsnaam: ${context.fileName || 'onbekend'}
        - Pad: ${context.path || 'onbekend'}
        - Gekoppeld aan: ${context.legacyContext?.parent_title || 'onbekend'} (${context.legacyContext?.parent_type || 'onbekend'})
        - Bron: ${context.source || 'onbekend'}
        
        Gebruik deze info om specifieke personen (zoals Johfrah, Mark, etc.) of locaties te herkennen indien relevant.
      ` : '';

      const prompt = `
        Analyseer deze afbeelding voor een high-end voice-over bureau (Voices.be).
        ${contextPrompt}
        
        Beschrijf wat je ziet in een menselijke, zachte tone-of-voice (Voices-vibe).
        Focus op: sfeer, menselijkheid, vakmanschap, studio-elementen.
        Houd de beschrijving kort (max 2 zinnen).
        Geef het resultaat terug in strikt JSON formaat.

        JSON structuur:
        {
          "description": "De beschrijving",
          "labels": ["label1", "label2"],
          "vibe": "warm" | "zakelijk" | "creatief" | "rustig",
          "authenticity": "real" | "stock" | "ai_generated" | "unknown",
          "confidence": 0-1,
          "suggested_alt": "Editoriaal verantwoorde alt-tekst (max 125 tekens)"
        }
      `;

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('❌ Gemini Vision Error:', error);
      return {
        description: 'Geen beschrijving beschikbaar',
        labels: [],
        vibe: 'onbekend',
        authenticity: 'unknown',
        confidence: 0,
        suggested_alt: ''
      };
    }
  }
}
