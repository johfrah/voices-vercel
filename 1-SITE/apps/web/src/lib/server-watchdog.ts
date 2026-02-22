import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";

/**
 *  SERVER WATCHDOG (2026)
 * 
 * Doel: Rapporteert server-side errors direct naar de Watchdog API.
 * Wordt gebruikt in Server Components en API routes.
 */
export class ServerWatchdog {
  static async report(options: {
    error: string;
    stack?: string;
    component: string;
    url?: string;
    level?: 'info' | 'error' | 'critical';
  }) {
    try {
      const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voices.be';
      
      // We gebruiken fetch naar de interne API route
      // We wachten hier niet op (fire and forget) om de main thread niet te blokkeren
      fetch(`${host}/api/admin/system/watchdog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: options.error,
          stack: options.stack,
          component: options.component,
          url: options.url || 'Server-Side',
          level: options.level || 'error'
        })
      }).catch(err => console.error('[ServerWatchdog] Failed to post to watchdog API:', err));
      
      console.error(`[ServerWatchdog] Reported ${options.level || 'error'}: ${options.error}`);
    } catch (e) {
      console.error('[ServerWatchdog] Fatal failure in reporting logic:', e);
    }
  }
}
