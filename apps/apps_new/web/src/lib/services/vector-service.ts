import { GeminiService } from './gemini-service';

/**
 *  VECTOR SERVICE (2026)
 * 
 * Doel: Genereert semantische embeddings voor teksten (mails, scripts, briefings).
 * 🛡️ CHRIS-PROTOCOL: Volledig gemigreerd naar Gemini text-embedding-004 (v2.16.104)
 */
export class VectorService {
  private gemini: GeminiService;
  private static instance: VectorService;

  constructor() {
    this.gemini = GeminiService.getInstance();
  }

  public static getInstance(): VectorService {
    if (!VectorService.instance) {
      VectorService.instance = new VectorService();
    }
    return VectorService.instance;
  }

  /**
   * Genereert een vector voor een gegeven tekst via Gemini.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) return [];
    return this.gemini.generateEmbedding(text);
  }
}
