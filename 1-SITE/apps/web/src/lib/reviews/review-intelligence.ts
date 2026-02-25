import { db, reviews, actors } from '@/lib/system/db';
import { eq, sql, desc, ilike, and } from 'drizzle-orm';

/**
 *  REVIEW INTELLIGENCE SERVICE (2026)
 * 
 * Doel: Klantfeedback omzetten in actieerbare data voor de systeem-kern.
 * - Automatisch taggen van stemacteurs op basis van reviews.
 * - Berekenen van sentiment-velocity.
 * - Koppelen van reviews aan specifieke project-types (DNA).
 */

export interface ReviewInsight {
  actorId: number;
  averageRating: number;
  totalReviews: number;
  topTags: string[];
  sentimentScore: number; // 0-100
}

export class ReviewIntelligence {
  /**
   * Analyseert alle reviews voor een specifieke acteur en genereert insights
   */
  static async getActorInsights(actorId: number): Promise<ReviewInsight | null> {
    try {
      const actorReviews = await db
        .select()
        .from(reviews)
        .where(sql`${reviews.iapContext}->>'actorId' = ${actorId.toString()}`);

      if (actorReviews.length === 0) return null;

      const totalRating = actorReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = totalRating / actorReviews.length;

      //  AI Logic: Extract tags from review text (Simulatie van de batch-intelligence)
      const tags = this.extractTagsFromText(actorReviews.map(r => r.textNl || '').join(' '));

      return {
        actorId,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: actorReviews.length,
        topTags: tags.slice(0, 5),
        sentimentScore: (avgRating / 5) * 100
      };
    } catch (error) {
      console.error('[Review Intelligence Error]:', error);
      return null;
    }
  }

  /**
   * Core Logic: Vertaalt tekst naar tags (Vervangt PHP review-intelligence.php)
   * Voegt expliciet 'ai:' prefix toe om herkomst te waarborgen.
   */
  private static extractTagsFromText(text: string): string[] {
    const keywords: Record<string, string[]> = {
      'Warm': ['warm', 'zacht', 'vriendelijk', 'rustig'],
      'Zakelijk': ['zakelijk', 'corporate', 'professioneel', 'strak'],
      'Energetisch': ['enthousiast', 'power', 'energie', 'snel'],
      'Betrouwbaar': ['betrouwbaar', 'helder', 'duidelijk', 'overtuigend'],
      'Inspirerend': ['inspirerend', 'mooi', 'verhaal', 'meeslepend']
    };

    const foundTags: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [tag, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerText.includes(term))) {
        foundTags.push(`ai:${tag}`);
      }
    }

    return foundTags;
  }

  /**
   * Batch Update: Synchroniseer de berekende tags terug naar de actors tabel
   */
  static async syncActorTags(actorId: number) {
    const insights = await this.getActorInsights(actorId);
    if (insights) {
      await db.update(actors)
        .set({ 
          aiTags: insights.topTags.join(', '),
          voiceScore: Math.round(insights.averageRating * 2) // Normaliseer naar 1-10
        })
        .where(eq(actors.id, actorId));
    }
  }
}
