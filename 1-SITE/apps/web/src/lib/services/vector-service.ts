import OpenAI from 'openai';

/**
 *  VECTOR SERVICE (2026)
 * 
 * Doel: Genereert semantische embeddings voor teksten (mails, scripts, briefings).
 * Maakt gebruik van OpenAI text-embedding-3-small (1536 dims).
 */
export class VectorService {
  private openai: OpenAI;
  private static instance: VectorService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  public static getInstance(): VectorService {
    if (!vector-service.instance) {
      vector-service.instance = new VectorService();
    }
    return vector-service.instance;
  }

  /**
   * Genereert een vector voor een gegeven tekst.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) return [];
    
    try {
      // Limiteer tekstlengte voor embeddings (max ~8k tokens)
      const cleanText = text.substring(0, 8000).replace(/\n/g, ' ');
      
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: cleanText,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error(' Vector Generation Error:', error);
      return [];
    }
  }
}
