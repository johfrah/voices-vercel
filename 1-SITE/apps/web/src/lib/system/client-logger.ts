/**
 *  NUCLEAR CLIENT LOGGER (2026)
 *  Zorgt dat browser-fouten direct in de database landen met maximale forensische precisie.
 * 
 *  CHRIS-PROTOCOL: "Geen aannames, alleen feiten."
 */

interface Breadcrumb {
  timestamp: string;
  type: 'log' | 'warn' | 'error' | 'click' | 'navigation' | 'fetch';
  message: string;
  details?: any;
}

export class ClientLogger {
  private static isInitialized = false;
  private static breadcrumbs: Breadcrumb[] = [];
  private static readonly MAX_BREADCRUMBS = 20;

  static init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 1. 🛡️ Global Error Listener
    window.addEventListener('error', (event) => {
      this.addBreadcrumb('error', `Runtime Error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      this.report('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // 2. 🛡️ Unhandled Rejection Listener (Promises)
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const message = reason?.message || String(reason);
      this.addBreadcrumb('error', `Unhandled Promise Rejection: ${message}`);
      this.report('error', `Unhandled Promise Rejection: ${message}`, {
        stack: reason?.stack,
        reason: this.serialize(reason)
      });
    });

    // 3. 🛡️ Console Interception
    this.interceptConsole();

    // 4. 🛡️ Fetch Interception
    this.interceptFetch();

    // 5. 🛡️ Interaction Interception
    this.interceptInteractions();

    this.isInitialized = true;
    console.log('🚀 [Voices] Client Logger initialized (Nuclear Mode)');
  }

  private static interceptConsole() {
    const levels: ('log' | 'warn' | 'error')[] = ['log', 'warn', 'error'];
    
    levels.forEach(level => {
      const original = (console as any)[level];
      (console as any)[level] = (...args: any[]) => {
        original.apply(console, args);
        
        const message = args.map(arg => this.stringify(arg)).join(' ');
        
        // Voorkom loops met onze eigen logs
        if (message.includes('/api/admin/system/')) return;

        this.addBreadcrumb(level, message.substring(0, 500));

        // 🛡️ CHRIS-PROTOCOL: Full Visibility Mode (v2.14.241)
        // We loggen nu ALLES direct naar de server voor maximale debug-kracht.
        const isVoicesLog = message.includes('[Voices]') || message.includes('[CheckoutContext]') || message.includes('[Watchdog]');
        
        if (level === 'error' || level === 'warn' || isVoicesLog) {
          const errorObj = args.find(arg => arg instanceof Error);
          this.report(level as any, `${level.toUpperCase()}: ${message.substring(0, 500)}`, {
            full_console_output: message,
            stack: errorObj?.stack || (level === 'error' ? new Error().stack : undefined),
            args: args.map(arg => this.serialize(arg))
          });
        }
      };
    });
  }

  private static interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      // 🛡️ CHRIS-PROTOCOL: Robust URL extraction (v2.14.236)
      // fetch(input) can take string, Request, or URL object.
      let url = '';
      try {
        const input = args[0];
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input && typeof input === 'object') {
          // Request object or other object with url property
          url = (input as any).url || String(input);
        } else {
          url = String(input || '');
        }
      } catch (e) {
        url = '[Unknown URL]';
      }

      // 🛡️ CHRIS-PROTOCOL: Guarded method extraction
      let method = 'GET';
      try {
        method = (args[1]?.method || (args[0] as any)?.method || 'GET').toUpperCase();
      } catch (e) {}
      
      // 🛡️ CHRIS-PROTOCOL: Safe includes check
      const isSystemApi = typeof url === 'string' && url.includes('/api/admin/system/');
      
      if (url && !isSystemApi) {
        this.addBreadcrumb('fetch', `${method} ${url}`);
      }

      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && url && !isSystemApi) {
          this.addBreadcrumb('error', `Fetch Failed: ${response.status} ${url}`);
          const clone = response.clone();
          clone.text().then(body => {
            this.report('error', `API Failure: ${response.status} ${url}`, {
              url,
              status: response.status,
              statusText: response.statusText,
              responseBody: body.substring(0, 1000)
            });
          }).catch(() => {});
        }
        
        return response;
      } catch (error: any) {
        if (url && !isSystemApi) {
          this.addBreadcrumb('error', `Fetch Network Error: ${url}`);
          this.report('error', `Network Error: ${url}`, {
            url,
            error: error.message,
            stack: error.stack
          });
        }
        throw error;
      }
    };
  }

  private static interceptInteractions() {
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target) {
        const label = target.innerText?.substring(0, 30) || target.getAttribute('aria-label') || target.id || target.tagName;
        this.addBreadcrumb('click', `User clicked: ${label}`);
        
        // 🛡️ CHRIS-PROTOCOL: Real-time interaction logging for debugging
        if (label.toLowerCase().includes('bestel') || label.toLowerCase().includes('order') || target.closest('button')) {
          this.report('info', `Interaction: ${label}`, { 
            type: 'click', 
            element: target.tagName,
            classes: target.className 
          });
        }
      }
    }, true);

    // Navigation tracking
    let lastPath = window.location.pathname;
    
    // 🛡️ CHRIS-PROTOCOL: Log initial pageview
    this.report('info', `Pageview: ${lastPath}`, { 
      type: 'navigation', 
      url: window.location.href 
    });

    setInterval(() => {
      if (window.location.pathname !== lastPath) {
        const oldPath = lastPath;
        lastPath = window.location.pathname;
        this.addBreadcrumb('navigation', `Navigated to: ${lastPath}${window.location.search}`);
        
        // 🛡️ CHRIS-PROTOCOL: Log route changes as info events
        this.report('info', `Navigation: ${oldPath} -> ${lastPath}`, {
          type: 'navigation',
          from: oldPath,
          to: lastPath,
          search: window.location.search
        });
      }
    }, 1000);
  }

  private static addBreadcrumb(type: Breadcrumb['type'], message: string, details?: any) {
    this.breadcrumbs.push({
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    });

    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Stringify helper die Errors en Objecten fatsoenlijk omzet
   */
  private static stringify(arg: any): string {
    if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(this.serialize(arg));
      } catch (e) {
        return '[Complex Object]';
      }
    }
    return String(arg);
  }

  /**
   * Serialize helper die non-enumerable properties van Errors meepakt
   */
  private static serialize(obj: any, depth = 0): any {
    if (depth > 3) return '[Max Depth]';
    if (obj === null || obj === undefined) return obj;
    
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        ...(obj as any)
      };
    }

    if (typeof Response !== 'undefined' && obj instanceof Response) {
      return {
        type: 'Response',
        status: obj.status,
        statusText: obj.statusText,
        url: obj.url,
        ok: obj.ok
      };
    }

    if (typeof Event !== 'undefined' && obj instanceof Event) {
      return {
        type: obj.type,
        target: obj.target ? (obj.target as any).tagName || 'unknown' : undefined,
        currentTarget: obj.currentTarget ? (obj.currentTarget as any).tagName || 'unknown' : undefined
      };
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.serialize(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const res: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          res[key] = this.serialize(obj[key], depth + 1);
        }
      }
      return res;
    }

    return obj;
  }

  static async report(level: 'info' | 'warn' | 'error', message: string, details: any = {}) {
    try {
      const payload = JSON.stringify({
        level,
        message,
        source: 'browser',
        details: {
          ...details,
          breadcrumbs: this.breadcrumbs,
          location: window.location.href,
          pathname: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          screen: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          memory: (performance as any)?.memory ? {
            used: Math.round((performance as any).memory.usedJSHeapSize / 1048576) + 'MB',
            total: Math.round((performance as any).memory.totalJSHeapSize / 1048576) + 'MB'
          } : undefined
        }
      });

      if (typeof navigator !== 'undefined' && navigator.sendBeacon && payload.length < 64000) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/admin/system/logs', blob);
        
        // Als het een error is, sturen we hem ook naar de Watchdog voor escalatie
        if (level === 'error') {
          navigator.sendBeacon('/api/admin/system/watchdog', blob);
        }
      } else {
        const fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        };
        
        await fetch('/api/admin/system/logs', fetchOptions);
        
        if (level === 'error') {
          await fetch('/api/admin/system/watchdog', fetchOptions);
        }
      }
    } catch (e) {
      // Stille fail
    }
  }
}
