import { db, getTable } from '@/lib/system/voices-config';

const systemEvents = getTable('systemEvents');
import { eq, desc } from 'drizzle-orm';

export class SelfHealingService {
  static async healPageTitle(slug: string, currentTitle: string | null): Promise<string> {
    if (currentTitle && currentTitle.length > 2) return currentTitle;
    const fallbackTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
    return fallbackTitle;
  }

  static isSlop(text: string): boolean {
    const slopTerms = ['eenvoudig', 'uniek', 'impact', 'oplossing', 'innovatief'];
    return slopTerms.some(term => text.toLowerCase().includes(term));
  }

  static async logEvent(level: 'info' | 'warn' | 'error', message: string, details: any = {}) {
    try {
      // 🛡️ CHRIS-PROTOCOL: Consolideer events om mail-spam te voorkomen
      if (!systemEvents) {
        console.warn(' [HEAL] systemEvents table not available');
        return;
      }
      const recentEvents = await db.select().from(systemEvents)
        .where(eq(systemEvents.message, message))
        .orderBy(desc(systemEvents.createdAt))
        .limit(1);

      if (recentEvents.length > 0) {
        const lastEvent = recentEvents[0];
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (lastEvent.createdAt && lastEvent.createdAt > tenMinutesAgo) {
          console.log(` [HEAL] Event geconsolideerd (spam preventie): ${message}`);
          return;
        }
      }

      await db.insert(systemEvents).values({
        level,
        source: 'self-healing',
        message,
        details
      });
    } catch (e) {
      console.error(' [HEAL] Kon event niet loggen:', e);
    }
  }

  static async handle404(path: string, referrer: string): Promise<{ suggestion?: string }> {
    await this.logEvent('warn', `404 Error op pad: ${path}`, { referrer });
    
    // Simpele logica voor suggesties
    if (path.includes('login')) return { suggestion: '/account' };
    if (path.includes('studio')) return { suggestion: '/studio' };
    if (path.includes('agency')) return { suggestion: '/agency' };
    
    return {};
  }

  static async reportDataAnomaly(type: string, id: string, message: string) {
    await this.logEvent('info', `Anomaly gedetecteerd (${type}) voor ID ${id}: ${message}`);
  }

  static async reportBrokenAsset(path: string, context: string, host?: string) {
    await this.logEvent('error', `Broken asset gedetecteerd: ${path}`, { context, host });
  }

  static async getRecentHeals() {
    return []; // Placeholder
  }
}
