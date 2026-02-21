import OpenAI from "openai";
import { db } from "@db";
import { systemKnowledge } from "@db/schema";
import { eq, or } from "drizzle-orm";

/**
 *  OPENAI INTELLIGENCE SERVICE (2026)
 * 
 * Doel: Betrouwbare vertalingen en analyses via GPT-4o.
 * Wordt ingezet als Gemini rate-limits raakt of voor complexere taken.
 */
export class OpenAIService {
  private openai: OpenAI;
  private static instance: OpenAIService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Haalt Market DNA en Glossary op uit system_knowledge voor een specifieke taal.
   */
  async getMarketDNA(lang: string): Promise<string> {
    try {
      const dnaRecords = await db
        .select({ content: systemKnowledge.content, slug: systemKnowledge.slug })
        .from(systemKnowledge)
        .where(or(
          eq(systemKnowledge.slug, `market-dna-${lang.toLowerCase()}`),
          eq(systemKnowledge.slug, `industry-glossary-${lang.toLowerCase()}`)
        ));
      
      return dnaRecords.map(r => r.content).join("\n\n");
    } catch (e) {
      console.error(`[OpenAIService] Failed to fetch DNA/Glossary for ${lang}:`, e);
      return "";
    }
  }

  /**
   * Genereert platte tekst via OpenAI.
   * Gebruikt gpt-4o-mini voor standaard taken, gpt-4o voor audits.
   */
  async generateText(prompt: string, model: "gpt-4o-mini" | "gpt-4o" = "gpt-4o-mini", lang?: string): Promise<string> {
    try {
      let finalPrompt = prompt;
      
      // Als er een taal is meegegeven, injecteren we de Market DNA
      if (lang) {
        const dna = await this.getMarketDNA(lang);
        if (dna) {
          finalPrompt = `
MARKET DNA RULES (MANDATORY):
${dna}

PEER REVIEW PROTOCOL:
If the task is an audit or translation, simulate a native peer review. 
Ask yourself: "Would a local professional really say this, or is this 'translation-ese'?"
Use common industry abbreviations (like 'à.p.d.' in French) if it's for a UI element.

TASK:
${prompt}
          `;
        }
      }

      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: finalPrompt }],
        max_tokens: 500,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error(` OpenAI Text Generation Error (${model}):`, error);
      throw error;
    }
  }

  /**
   * Static shortcut voor generateText.
   */
  static async generateText(prompt: string, model: "gpt-4o-mini" | "gpt-4o" = "gpt-4o-mini", lang?: string): Promise<string> {
    return OpenAIService.getInstance().generateText(prompt, model, lang);
  }
}
