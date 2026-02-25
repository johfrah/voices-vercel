import { db, systemKnowledge } from '@/lib/system/db';

/**
 *  SENTIMENT ENGINE (ADULT VOICY)
 * 
 * Analyseert tekst op emotionele lading, haast en waarachtigheid.
 * Gebruikt de 'Grondwet' om de juiste toon te bepalen.
 */

export class SentimentEngine {
  /**
   * Analyseert een tekst en geeft een score tussen -1 (negatief/frustratie) en 1 (positief/enthousiasme).
   * Detecteert ook 'Urgentie' en 'Waarachtigheid'.
   */
  static async analyze(text: string) {
    const lowerText = text.toLowerCase();
    
    let score = 0;
    let urgency = 0; // 0 tot 1
    const detectedTriggers: string[] = [];

    // 1. Negatieve Triggers (Frictie)
    const negativeWords = ['klacht', 'fout', 'duurt lang', 'niet tevreden', 'geen reactie', 'teleurgesteld'];
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        score -= 0.3;
        detectedTriggers.push(`frictie:${word}`);
      }
    });

    // 2. Positieve Triggers (Enthousiasme)
    const positiveWords = ['bedankt', 'super', 'mooi', 'top', 'blij', 'graag', 'perfect'];
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 0.2;
        detectedTriggers.push(`positief:${word}`);
      }
    });

    // 3. Urgentie Triggers (Haast)
    const urgencyWords = ['nu', 'asap', 'spoed', 'deadline', 'vandaag nog', 'direct'];
    urgencyWords.forEach(word => {
      if (lowerText.includes(word)) {
        urgency += 0.4;
        detectedTriggers.push(`urgentie:${word}`);
      }
    });

    // Score begrenzen
    score = Math.max(-1, Math.min(1, score));
    urgency = Math.min(1, urgency);

    return {
      score,
      urgency,
      triggers: detectedTriggers,
      label: this.getLabel(score, urgency)
    };
  }

  private static getLabel(score: number, urgency: number): string {
    if (score < -0.2) return 'Frictie gedetecteerd (Empathie nodig)';
    if (urgency > 0.5) return 'Hoge urgentie (Snelheid & Rust nodig)';
    if (score > 0.4) return 'Positieve vibe (Waardering tonen)';
    return 'Neutrale/Zakelijke toon';
  }
}
