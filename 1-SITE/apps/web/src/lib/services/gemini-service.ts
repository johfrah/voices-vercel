import { GoogleGenerativeAI } from "@google/generative-ai";
import { db, getTable } from '@/lib/system/voices-config';
const systemKnowledge = getTable('systemKnowledge');
import { eq, or } from "drizzle-orm";
import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";

/**
 *  GEMINI INTELLIGENCE SERVICE (2026)
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
   * Haalt Market DNA en Glossary op uit system_knowledge voor een specifieke taal.
   */
  async getMarketDNA(lang: string): Promise<string> {
    try {
      const dnaRecords = await db
        .select({ content: systemKnowledge.content })
        .from(systemKnowledge)
        .where(or(
          eq(systemKnowledge.slug, `market-dna-${lang.toLowerCase()}`),
          eq(systemKnowledge.slug, `industry-glossary-${lang.toLowerCase()}`)
        ));
      
      return dnaRecords.map(r => r.content).join("\n\n");
    } catch (e) {
      console.error(`[GeminiService] Failed to fetch DNA for ${lang}:`, e);
      return "";
    }
  }

  /**
   * Helper om het model op te halen met de juiste v1beta compatibiliteit
   */
  private getModel() {
    //  GEMINI 2026 UPGRADE: Gebruik gemini-flash-latest voor maximale stabiliteit en snelheid
    return this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  }

  /**
   * Genereert platte tekst via Gemini. Gebruikt door heal-routes, chat en Telegram-Bob.
   * NU MET AGENT-MANDAAT: Kan gestructureerde acties voorstellen.
   */
  async generateText(prompt: string, options?: { jsonMode?: boolean, lang?: string, host?: string }): Promise<string> {
    try {
      const model = this.getModel();
      let finalPrompt = prompt;

      //  MARKET DNA INJECTION: Als er een taal is meegegeven, injecteren we de regels
      if (options?.lang) {
        const dna = await this.getMarketDNA(options.lang);
        if (dna) {
          finalPrompt = `
MARKET DNA & INCLUSIVITY RULES (MANDATORY):
${dna}

TASK:
${prompt}
          `;
        }
      }
      
      //  CHRIS-PROTOCOL: Voeg een timeout toe aan de Gemini call (Next.js Edge compatibel)
      //  GEMINI 2026: Timeout verhoogd naar 60s voor zware bulk-taken
      const result = await Promise.race([
        model.generateContent(options?.jsonMode ? `${finalPrompt}\n\nANTWOORD UITSLUITEND IN STRIKT JSON FORMAAT.` : finalPrompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini Timeout')), 60000))
      ]) as any;

      const text = result.response.text();
      return options?.jsonMode ? text.replace(/```json|```/g, '').trim() : text;
    } catch (error: any) {
      console.error(' Gemini Text Generation Error:', error);
      if (error.message === 'Gemini Timeout') {
        return options?.jsonMode ? JSON.stringify({ message: "Ik heb even wat meer tijd nodig om na te denken." }) : "Ik heb even wat meer tijd nodig om na te denken. Probeer je het zo nog eens?";
      }
      throw error;
    }
  }

  /**
   * Static shortcut voor generateText (compat met heal-routes).
   */
  static async generateText(prompt: string, options?: { jsonMode?: boolean, lang?: string, host?: string }): Promise<string> {
    return GeminiService.getInstance().generateText(prompt, options);
  }

  /**
   * Analyseert een mail en geeft gestructureerde AI data terug.
   */
  async analyzeMail(subject: string, body: string, host?: string) {
    try {
      const model = this.getModel();
      const market = MarketManager.getCurrentMarket(host);

      const prompt = `
        Analyseer de volgende e-mail voor een voice-over bureau (${market.name} - ${host || 'Voices'}).
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
          "suggested_action": "Wat moet de admin doen?"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean JSON from potential markdown fences
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(' Gemini Analysis Error:', error);
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
      const market = MarketManager.getCurrentMarket(context?.host);

      const contextPrompt = context ? `
        Aanvullende context over deze afbeelding:
        - Bestandsnaam: ${context.fileName || 'onbekend'}
        - Pad: ${context.path || 'onbekend'}
        - Gekoppeld aan: ${context.legacyContext?.parent_title || 'onbekend'} (${context.legacyContext?.parent_type || 'onbekend'})
        - Bron: ${context.source || 'onbekend'}
        
        Gebruik deze info om specifieke personen (zoals Johfrah, Mark, etc.) of locaties te herkennen indien relevant.
      ` : '';

      const prompt = `
        Analyseer deze afbeelding voor een high-end voice-over bureau (${market.name} - ${context?.host || 'Voices'}).
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
      console.error(' Gemini Vision Error:', error);
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
