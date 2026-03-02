import { db } from '@/lib/system/voices-config';
import { quizSteps } from '@/lib/system/voices-config';
import { eq, asc } from "drizzle-orm";

/**
 *  NUCLEAR QUIZ SERVICE (2026)
 * 
 * Beheert de logica voor interactieve quizen en funnels.
 * Vervangt de PHP Quiz System en Quiz Provider.
 */

export interface QuizOption {
  label: string;
  value: string;
  weight?: Record<string, number>; // Bijv. { 'corporate': 5, 'warm': 2 }
  nextStep?: number;
}

export interface QuizStep {
  id: number;
  quizSlug: string;
  stepOrder: number;
  question: string;
  options: QuizOption[];
}

export class QuizService {
  /**
   * Haalt alle stappen van een specifieke quiz op.
   */
  static async getQuiz(quizSlug: string): Promise<QuizStep[]> {
    const steps = await db
      .select()
      .from(quizSteps)
      .where(eq(quizSteps.quizSlug, quizSlug))
      .orderBy(asc(quizSteps.stepOrder));

    return steps.map((step: any) => ({
      id: step.id,
      quizSlug: step.quizSlug,
      stepOrder: step.stepOrder,
      question: step.question,
      options: step.options as QuizOption[]
    }));
  }

  /**
   * Analyseert de resultaten van een quiz om een aanbeveling te doen.
   */
  static calculateRecommendation(answers: Record<number, string>, steps: QuizStep[]) {
    const scores: Record<string, number> = {};

    for (const step of steps) {
      const selectedValue = answers[step.id];
      const option = step.options.find(o => o.value === selectedValue);

      if (option?.weight) {
        for (const [category, weight] of Object.entries(option.weight)) {
          scores[category] = (scores[category] || 0) + weight;
        }
      }
    }

    // Sorteer scores van hoog naar laag
    const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);
    
    return {
      topCategory: sortedScores[0]?.[0] || 'general',
      scores: Object.fromEntries(sortedScores)
    };
  }
}
