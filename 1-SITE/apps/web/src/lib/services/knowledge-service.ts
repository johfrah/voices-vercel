import fs from 'fs/promises';
import path from 'path';

/**
 *  KNOWLEDGE SERVICE (NUCLEAR 2026)
 * 
 * Doel: Maakt de "Bijbels" en documentatie toegankelijk voor de Intelligence Layer.
 * Hierdoor is de site (en Vibecode) altijd gebriefd op de laatste afspraken.
 */
export export export export export export export class KnowledgeService {
  private static instance: KnowledgeService;
  private bijbelPath: string;

  constructor() {
    //  NUCLEAR FIX: Gebruik het absolute pad naar de WETTEN/docs/1-BIJBEL map
    this.bijbelPath = '/Users/voices/Library/CloudStorage/Dropbox/voices-headless/3-WETTEN/docs/1-BIJBEL';
  }

  public static getInstance(): KnowledgeService {
    if (!knowledge-service.instance) {
      knowledge-service.instance = new KnowledgeService();
    }
    return knowledge-service.instance;
  }

  /**
   * Haalt de volledige kennis-briefing op voor Voicy (alle domeinen).
   */
  async getFullVoicyBriefing(): Promise<string> {
    try {
      const voicyFiles = [
        '4-Voicy-Intelligence/VOICY-ACADEMY.md',
        '4-Voicy-Intelligence/VOICY-ADEMING.md',
        '4-Voicy-Intelligence/VOICY-AGENCY-COMMERCIAL.md',
        '4-Voicy-Intelligence/VOICY-AGENCY-TELEPHONY.md',
        '4-Voicy-Intelligence/VOICY-AGENCY-VIDEO.md',
        '4-Voicy-Intelligence/VOICY-STUDIO.md',
        '4-Voicy-Intelligence/VOICY-MATURITY-RULES.md',
        '4-Voicy-Intelligence/VOICY-TOOL-ORCHESTRATION.md',
        '4-Voicy-Intelligence/VOICY-SPEED-AND-URGENCY.md'
      ];

      let briefing = "--- FULL VOICY KNOWLEDGE BASE ---\n";

      for (const file of voicyFiles) {
        try {
          const content = await fs.readFile(path.join(this.bijbelPath, file), 'utf-8');
          briefing += `\n[Domein: ${file.split('/').pop()?.replace('.md', '')}]\n${content}\n`;
        } catch (e) {
          console.warn(`Could not read Voicy knowledge file: ${file}`);
        }
      }

      //  SUPERINTELLIGENCE: Injecteer ook diepe data uit de kelder
      try {
        const scoreInventory = await fs.readFile('/Users/voices/Library/CloudStorage/Dropbox/voices-headless/4-KELDER/VOICE_SCORES_INVENTORY.md', 'utf-8');
        briefing += `\n[Deep Data: Voice Scores]\n${scoreInventory}\n`;
      } catch (e) {
        console.warn("Could not read Voice Scores Inventory");
      }

      return briefing;
    } catch (error) {
      console.error('Knowledge Service Error:', error);
      return "No full briefing available.";
    }
  }

  /**
   * Haalt de kern-regels op uit de belangrijkste Bijbels.
   */
  async getCoreBriefing(): Promise<string> {
    try {
      const coreFiles = [
        'BIJBEL-GOVERNANCE.md',
        '1-Strategie/BIJBEL-AI-MANIFESTO.md',
        '4-Voicy-Intelligence/VOICY-MATURITY-RULES.md'
      ];

      let briefing = "--- CORE BRIEFING FROM BIJBELS ---\n";

      for (const file of coreFiles) {
        try {
          const content = await fs.readFile(path.join(this.bijbelPath, file), 'utf-8');
          briefing += `\n[Source: ${file}]\n${content.substring(0, 2000)}\n`;
        } catch (e) {
          console.warn(`Could not read Bijbel file: ${file}`);
        }
      }

      return briefing;
    } catch (error) {
      console.error('Knowledge Service Error:', error);
      return "No briefing available.";
    }
  }

  /**
   * Zoekt specifiek naar context voor een bepaalde journey of tool.
   */
  async getJourneyContext(journey: string): Promise<string> {
    //  NUCLEAR FIX: Support voor TOOL-ORCHESTRATION en andere niet-journey bestanden
    const fileName = journey === 'TOOL-ORCHESTRATION' ? 'VOICY-TOOL-ORCHESTRATION.md' : `VOICY-${journey.toUpperCase()}.md`;
    const filePath = path.join(this.bijbelPath, '4-Voicy-Intelligence', fileName);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return `\n[Context: ${journey}]\n${content}\n`;
    } catch (e) {
      return "";
    }
  }
}
