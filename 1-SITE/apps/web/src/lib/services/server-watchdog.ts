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
    payload?: any;
    schema?: string;
  }) {
    console.log(`🛡️ [ServerWatchdog] Reporting error: ${options.error}`);
    try {
      // 🛡️ CHRIS-PROTOCOL: Nuclear Payload Scrubbing
      // We log the data that caused the crash, but remove sensitive fields
      const scrubbedPayload = options.payload ? { ...options.payload } : undefined;
      if (scrubbedPayload) {
        ['password', 'token', 'secret', 'key'].forEach(k => delete scrubbedPayload[k]);
      }

      // 🛡️ CHRIS-PROTOCOL: Use internal URL for server-to-server communication to avoid DNS/Vercel loops
      const internalUrl = process.env.NEXT_PUBLIC_SITE_URL || MarketManager.getMarketDomains()['BE'];
      
      // 🛡️ CHRIS-PROTOCOL: Direct DB logging fallback if API is unreachable
      try {
        const { db } = await import('@db');
        const { systemEvents } = await import('@database/schema');
        
        await db.insert(systemEvents).values({
          level: options.level || 'error',
          source: options.component || 'ServerWatchdog',
          message: options.error,
          details: {
            stack: options.stack,
            url: options.url || 'Server-Side',
            payload: scrubbedPayload,
            schema: options.schema,
            timestamp: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        }).catch(e => console.warn('[ServerWatchdog] Direct DB logging failed, falling back to fetch:', e));
      } catch (dbErr) {
        // Fallback to fetch if DB is not available
      }

      fetch(`${internalUrl}/api/admin/system/watchdog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: options.error,
          stack: options.stack,
          component: options.component,
          url: options.url || 'Server-Side',
          level: options.level || 'error',
          payload: scrubbedPayload,
          schema: options.schema
        })
      }).catch(err => console.error('[ServerWatchdog] Failed to post to watchdog API:', err));
      
      console.error(`[ServerWatchdog] Reported ${options.level || 'error'}: ${options.error}`);
    } catch (e) {
      console.error('[ServerWatchdog] Fatal failure in reporting logic:', e);
    }
  }
}
