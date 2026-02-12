import { db } from "@db";
import { courseProgress, users } from "@db/schema";
import { eq, and } from "drizzle-orm";

/**
 * 🛡️ SECURITY SERVICE
 * 
 * Voorkomt account-sharing en beheert Academy toegang.
 */

export const SecurityService = {
  /**
   * Controleer of een gebruiker toegang heeft tot een les
   */
  async checkAccess(userId: number, courseId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    // Admin heeft altijd toegang (God Mode)
    if (user?.role === 'admin') return true;

    // Check of de gebruiker de 'academy_student' subrol heeft
    const subroles = (user?.subroles as string[]) || [];
    if (!subroles.includes('academy_student')) return false;

    // TODO: Check of de specifieke cursus is gekocht (via orders/items)
    return true;
  },

  /**
   * Registreer een device fingerprint om sharing te detecteren
   */
  async trackDevice(userId: number, fingerprint: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    const activityLog = (user.activityLog as any[]) || [];
    const knownDevices = activityLog.filter(log => log.type === 'device_login').map(log => log.fingerprint);

    if (!knownDevices.includes(fingerprint)) {
      // Nieuw device gedetecteerd
      const newLog = [
        ...activityLog,
        { 
          type: 'device_login', 
          fingerprint, 
          timestamp: new Date().toISOString(),
          isNew: true 
        }
      ];

      await db.update(users)
        .set({ activityLog: newLog })
        .where(eq(users.id, userId));

      // Als er meer dan 3 devices zijn, stuur een waarschuwing naar de admin
      const deviceCount = new Set(newLog.filter(l => l.type === 'device_login').map(l => l.fingerprint)).size;
      if (deviceCount > 3) {
        console.warn(`🚨 Account sharing alert: User ${userId} has ${deviceCount} active devices.`);
        // Hier zouden we een entry in de approval_queue kunnen maken
      }
    }
  }
};
