import { db } from '@db';
import { systemEvents } from '@db/schema/index';

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
      await db.insert(systemEvents).values({
        level,
        source: 'self-healing',
        message,
        details
      });
    } catch (e) {
      console.error('❌ [HEAL] Kon event niet loggen:', e);
    }
  }
}
