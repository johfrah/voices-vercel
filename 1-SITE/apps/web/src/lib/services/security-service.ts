import { db, courseProgress, users } from '@/lib/system/db';
import { eq, and } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

//  CHRIS-PROTOCOL: SDK fallback voor als direct-connect faalt
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 *  SECURITY SERVICE
 * 
 * Voorkomt account-sharing en beheert Academy toegang.
 */

export const SecurityService = {
  /**
   * Controleer of een gebruiker toegang heeft tot een les
   */
  async checkAccess(userId: number, courseId: number) {
    let user: any = null;
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      user = dbUser;
    } catch (dbError) {
      console.warn(' Security Service Access Drizzle failed, falling back to SDK');
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      user = data;
    }
    
    // Admin heeft altijd toegang (God Mode)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (user?.role === 'admin' || (adminEmail && user?.email === adminEmail)) return true;

    // Check of de gebruiker de 'academy_student' subrol heeft
    const subroles = (user?.subroles as string[]) || [];
    if (subroles.includes('academy_student')) return true;

    return false;
  },

  /**
   * Registreer een device fingerprint om sharing te detecteren
   */
  async trackDevice(userId: number, fingerprint: string) {
    let user: any = null;
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      user = dbUser;
    } catch (dbError) {
      console.warn(' Security Service Track Drizzle failed, falling back to SDK');
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      user = data;
    }

    if (!user) return;

    const activityLog = (user.activity_log || user.activityLog || []) as any[];
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

      try {
        await db.update(users)
          .set({ activityLog: newLog })
          .where(eq(users.id, userId));
      } catch (updateError) {
        console.warn(' Security Service Update Drizzle failed, falling back to SDK');
        await supabase.from('users').update({ activity_log: newLog }).eq('id', userId);
      }

      // Als er meer dan 3 devices zijn, stuur een waarschuwing naar de admin
      const deviceCount = new Set(newLog.filter(l => l.type === 'device_login').map(l => l.fingerprint)).size;
      if (deviceCount > 3) {
        console.warn(` Account sharing alert: User ${userId} has ${deviceCount} active devices.`);
      }
    }
  }
};
