import { MarketManagerServer as MarketManager } from "@/lib/system/market-manager-server";

/**
 *  SERVER WATCHDOG (2026) - ATOMIC EDITION
 * 
 * Doel: Rapporteert server-side errors direct naar de Watchdog API.
 * Wordt gebruikt in Server Components en API routes.
 * 
 * 🛡️ CHRIS-PROTOCOL: Atomic Trace Mandate (v2.14.510)
 * Elke kritieke operatie moet een trace achterlaten van start tot eind.
 */
export class ServerWatchdog {
  static async report(options: {
    error: string;
    stack?: string;
    component: string;
    url?: string;
    level?: 'info' | 'warn' | 'error' | 'critical';
    payload?: any;
    schema?: string;
    details?: any;
  }) {
    console.log(`🛡️ [ServerWatchdog] Reporting ${options.level || 'error'}: ${options.error}`);
    try {
      // 🛡️ CHRIS-PROTOCOL: Nuclear Payload Scrubbing
      const scrubbedPayload = options.payload ? { ...options.payload } : undefined;
      if (scrubbedPayload) {
        ['password', 'token', 'secret', 'key', 'apiKey', 'auth'].forEach(k => delete scrubbedPayload[k]);
      }

      const internalUrl = process.env.NEXT_PUBLIC_SITE_URL || MarketManager.getMarketDomains()['BE'];
      
      // 🛡️ CHRIS-PROTOCOL: Direct DB logging fallback (Atomic Pulse)
      try {
        const { db, getTable } = await import('@/lib/system/voices-config');
        const systemEvents = getTable('systemEvents');
        
        if (db && systemEvents) {
          await db.insert(systemEvents).values({
            level: options.level || 'error',
            source: options.component || 'ServerWatchdog',
            message: options.error,
            details: {
              stack: options.stack,
              url: options.url || 'Server-Side',
              payload: scrubbedPayload,
              schema: options.schema,
              extra: options.details,
              timestamp: new Date().toISOString()
            },
            createdAt: new Date().toISOString()
          }).catch((e: any) => console.warn('[ServerWatchdog] Direct DB logging failed:', e.message));
        }
      } catch (dbErr) {
        // Silent fail for DB, fetch will try next
      }

      // 🛡️ CHRIS-PROTOCOL: Cross-Service Notification
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
          schema: options.schema,
          details: options.details
        })
      }).catch(err => console.error('[ServerWatchdog] API post failed:', err.message));
      
    } catch (e) {
      console.error('[ServerWatchdog] Fatal failure in reporting logic:', e);
    }
  }

  /**
   * 🛡️ CHRIS-PROTOCOL: Atomic Trace (v2.14.510)
   * Wraps an async operation with forensic logging.
   */
  static async atomic<T>(
    component: string,
    operation: string,
    payload: any,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    // 1. Log Start
    await this.report({
      level: 'info',
      component,
      error: `ATOMIC START: ${operation}`,
      payload
    });

    try {
      // 2. Execute Operation
      const result = await fn();
      
      // 3. Log Success
      await this.report({
        level: 'info',
        component,
        error: `ATOMIC SUCCESS: ${operation}`,
        details: { durationMs: Date.now() - startTime }
      });

      return result;
    } catch (error: any) {
      // 4. Log Failure (Forensic)
      await this.report({
        level: 'critical',
        component,
        error: `ATOMIC CRASH: ${operation} - ${error.message}`,
        stack: error.stack,
        payload: { input: payload, errorDetails: error },
        details: { durationMs: Date.now() - startTime }
      });
      throw error;
    }
  }
}
