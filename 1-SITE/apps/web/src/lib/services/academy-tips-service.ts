import { db, academyTips, courseProgress } from '@/lib/system/voices-config';
import { eq, and, sql } from "drizzle-orm";

/**
 *  ACADEMY TIPS SERVICE
 * 
 * Beheert de dagelijkse reminders en vakgerichte tips voor studenten.
 */

export const AcademyTipsService = {
  /**
   * Haal een relevante tip op voor een gebruiker
   * Gebaseerd op hun huidige voortgang (hoofdstuk)
   */
  async getDailyTip(user_id: number) {
    // 1. Zoek het huidige hoofdstuk van de student
    const [latestProgress] = await db.select()
      .from(courseProgress)
      .where(eq(courseProgress.user_id, user_id))
      .orderBy(sql`${courseProgress.lessonId} DESC`)
      .limit(1);

    const currentLessonId = latestProgress?.lessonId || 1;

    // 2. Haal tips op die passen bij dit hoofdstuk of eerdere hoofdstukken
    const tips = await db.select()
      .from(academyTips)
      .where(sql`${academyTips.lessonId} <= ${currentLessonId}`)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    return tips[0] || null;
  },

  /**
   * Haal tips op per categorie (bijv. voor in de auto)
   */
  async getTipsByCategory(category: 'morning' | 'commute' | 'practice' | 'mindset') {
    return await db.select()
      .from(academyTips)
      .where(eq(academyTips.category, category))
      .orderBy(sql`RANDOM()`);
  }
};
