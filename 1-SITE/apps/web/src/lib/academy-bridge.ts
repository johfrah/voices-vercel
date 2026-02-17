import { AcademyDashboardData, Lesson } from "./api";
import { db } from "@db";
import { lessons, courseProgress, courseSubmissions } from "@db/schema";
import { eq, sql, and, count, asc } from "drizzle-orm";

/**
 *  NUCLEAR DATA BRIDGE - ACADEMY JOURNEY (FULL NATIVE)
 * 
 * Deze service is 100% vrij van legacy-bridge of legacyApiBaseUrl.
 * Het gebruikt direct Drizzle ORM voor alle data-operaties.
 * Status: FULL NUCLEAR.
 */

export interface StudentProgress {
  percentage: number;
  completedCount: number;
  totalLessons: number;
  streakDays: number;
  nextLessonId: number | null;
}

export interface SubmissionFeedback {
  lessonId: number;
  status: 'pending' | 'reviewed';
  scores: {
    pronunciation: number;
    intonation: number;
    credibility: number;
  };
  audioUrl?: string;
  textFeedback?: string;
}

export class AcademyDataBridge {
  /**
   * Haalt de volledige Academy dashboard configuratie op (100% Native)
   */
  static async getDashboardData(userId: number): Promise<AcademyDashboardData                 & { _nuclear: boolean }> {
    try {
      // 1. Haal alle lessen op
      const allLessons = await db.select().from(lessons).orderBy(asc(lessons.displayOrder));
      
      // 2. Haal voortgang op voor de gebruiker
      const progress = await db.select().from(courseProgress).where(eq(courseProgress.userId, userId));

      const mappedLessons: Lesson[] = allLessons.map(lesson => {
        const userProgress = progress.find(p => p.lessonId === lesson.id);
        let status: 'locked' | 'active' | 'completed' = 'locked';
        
        if (userProgress?.status === 'completed') {
          status = 'completed';
        } else if (userProgress?.status === 'in_progress' || lesson.displayOrder === 0) {
          status = 'active';
        }

        return {
          id: lesson.id,
          title: lesson.title,
          desc: lesson.description || '',
          status
        };
      });

      return {
        title: "Mijn Academy",
        subtitle: "Uw weg naar een professionele stemcarrire.",
        lessons: mappedLessons,
        _nuclear: true
      };
    } catch (error) {
      console.error("Core Logic Error (Academy Dashboard):", error);
      throw error;
    }
  }

  /**
   * Berekent student voortgang (Native Logic)
   */
  static async getStudentProgress(userId: number): Promise<StudentProgress> {
    try {
      const [allLessonsCount] = await db.select({ value: count() }).from(lessons);
      const [completedCount] = await db.select({ value: count() })
        .from(courseProgress)
        .where(and(eq(courseProgress.userId, userId), eq(courseProgress.status, 'completed')));

      const total = allLessonsCount.value || 1;
      const completed = completedCount.value || 0;
      const percentage = Math.min(100, Math.round((completed / total) * 100));

      // Streak logica (versimpeld voor nu)
      const streakDays = 0; 

      return {
        percentage,
        completedCount: completed,
        totalLessons: total,
        streakDays,
        nextLessonId: null // TODO: Bepaal volgende les
      };
    } catch (error) {
      console.error("Core Logic Error (Academy Progress):", error);
      return { percentage: 0, completedCount: 0, totalLessons: 1, streakDays: 0, nextLessonId: null };
    }
  }

  /**
   * Haalt feedback op voor inzendingen (Native Logic)
   */
  static async getFeedback(userId: number, lessonId?: number): Promise<SubmissionFeedback[]> {
    try {
      let query = db.select().from(courseSubmissions).where(eq(courseSubmissions.userId, userId));
      
      if (lessonId) {
        // @ts-ignore
        query = query.where(eq(courseSubmissions.lessonId, lessonId));
      }

      const submissions = await query;

      return submissions.map(s => ({
        lessonId: s.lessonId,
        status: s.status as any,
        scores: {
          pronunciation: s.scorePronunciation || 0,
          intonation: s.scoreIntonation || 0,
          credibility: s.scoreCredibility || 0
        },
        audioUrl: s.filePath,
        textFeedback: s.feedbackText || undefined
      }));
    } catch (error) {
      console.error("Core Logic Error (Academy Feedback):", error);
      return [];
    }
  }

  /**
   * Download student certificaat (Placeholder voor Native PDF Engine)
   */
  static async downloadCertificate(): Promise<void> {
    // In Beheer-modus gebruiken we een native PDF service
    console.log("Core Bridge: Certificate generation would happen here via Native Service");
    alert("Certificaat generatie wordt verhuisd naar de Native PDF Service.");
  }
}
