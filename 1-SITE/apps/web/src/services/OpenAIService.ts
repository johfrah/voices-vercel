import OpenAI from "openai";

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
   * Genereert platte tekst via OpenAI (GPT-4o mini voor snelheid/kosten).
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error(' OpenAI Text Generation Error:', error);
      throw error;
    }
  }

  /**
   * Static shortcut voor generateText.
   */
  static async generateText(prompt: string): Promise<string> {
    return OpenAIService.getInstance().generateText(prompt);
  }
}
