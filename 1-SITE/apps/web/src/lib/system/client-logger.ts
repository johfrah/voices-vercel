/**
 *  NUCLEAR CLIENT LOGGER (2026)
 *  Zorgt dat browser-fouten direct in de database landen.
 */
export class ClientLogger {
  private static isInitialized = false;

  static init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 🛡️ CHRIS-PROTOCOL: Global Error Listener
    window.addEventListener('error', (event) => {
      this.report('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // 🛡️ CHRIS-PROTOCOL: Unhandled Rejection Listener (Promises)
    window.addEventListener('unhandledrejection', (event) => {
      this.report('error', `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`, {
        stack: event.reason?.stack
      });
    });

    // 🛡️ CHRIS-PROTOCOL: Override console.error to capture intentional error logs
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      originalConsoleError.apply(console, args);
      
      // Voorkom oneindige lussen als de report zelf faalt
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (!message.includes('/api/admin/system/logs')) {
        this.report('error', `Console Error: ${message.substring(0, 500)}`, {
          full_console_output: message
        });
      }
    };

    this.isInitialized = true;
    console.log('🚀 [Voices] Client Logger initialized (Nuclear Mode)');
  }

  static async report(level: 'info' | 'warn' | 'error', message: string, details: any = {}) {
    try {
      // Gebruik fetch met keepalive zodat de request doorgaat zelfs als de pagina sluit
      await fetch('/api/admin/system/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          source: 'browser',
          details
        }),
        keepalive: true
      });
    } catch (e) {
      // Stille fail om loops te voorkomen
    }
  }
}
