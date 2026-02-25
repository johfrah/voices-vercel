import { db } from '@/lib/system/db';
import { users, visitors, systemEvents } from '@/lib/system/db';
import { eq, sql } from 'drizzle-orm';
import { GeminiService } from '@/lib/services/gemini-service';

/**
 *  INTENT LEARNING ENGINE (GOD MODE 2026)
 * 
 * Doel: Leren van user-gedrag (typen en lezen) om het Customer DNA te verrijken.
 * De machine wordt slimmer bij elke interactie.
 */

export interface UserInteraction {
  userId?: number;
  visitorHash: string;
  type: 'search' | 'read' | 'briefing' | 'chat';
  content: string;
  path: string;
}

export class IntentLearningEngine {
  /**
   * Verwerkt een interactie en update het DNA
   */
  static async learnFromInteraction(interaction: UserInteraction) {
    const { userId, visitorHash, type, content, path } = interaction;

    if (!content || content.length < 3) return;

    console.log(` INTENT LEARNING: Analyzing ${type} interaction from ${userId || visitorHash}`);

    try {
      // 1. AI Analyse van de interactie via Voicy
      const gemini = GeminiService.getInstance();
      const prompt = `
        Analyseer de volgende gebruikersinteractie op Voices.be.
        Bepaal de intentie, sector en specifieke behoeften.
        
        Type: ${type}
        Pad: ${path}
        Inhoud: "${content.substring(0, 1000)}"
        
        Geef terug in strikt JSON:
        {
          "intent": "bijv. prijs_vergelijken, workshop_zoeken, stem_boeken",
          "sector": "bijv. it, marketing, zorg, onbekend",
          "keywords": ["woord1", "woord2"],
          "confidence": 0-1
        }
      `;

      const analysis = await gemini.analyzeMail("Interaction Analysis", prompt); // Hergebruik mail analyzer voor structuur

      // 2. Sla interactie op in system events voor audit
      await db.insert(systemEvents).values({
        level: 'info',
        source: 'intent-learning',
        message: `Learned from ${type} on ${path}`,
        details: { interaction, analysis },
        createdAt: new Date()
      });

      // 3. Update User DNA in de database
      if (userId) {
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        
        if (user) {
          const currentInsights = (user.customerInsights as any) || { interactions: [] };
          
          // Voeg nieuwe interactie toe aan de historie
          const updatedInsights = {
            ...currentInsights,
            lastIntent: analysis.intent,
            detectedSector: analysis.sector !== 'onbekend' ? analysis.sector : currentInsights.detectedSector,
            interactions: [
              ...(currentInsights.interactions || []).slice(-10), // Bewaar laatste 10
              { type, path, analysis, timestamp: new Date() }
            ]
          };

          await db.update(users)
            .set({ 
              customerInsights: updatedInsights,
              updatedAt: new Date()
            })
            .where(eq(users.id, userId));
            
          console.log(` DNA Updated for user ${userId}: Intent=${analysis.intent}`);
        }
      }

      return analysis;
    } catch (error) {
      console.error(' Intent Learning failed:', error);
      return null;
    }
  }
}
