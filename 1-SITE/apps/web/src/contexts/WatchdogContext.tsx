"use client";

import React, { createContext, useContext, useEffect } from 'react';

/**
 *  WATCHDOG PROVIDER (2026)
 * 
 * Doel: Vangt alle onbehandelde runtime errors op de client-side op
 * en stuurt deze naar de /api/admin/system/watchdog route.
 */

const WatchdogContext = createContext<null>(null);

export const WatchdogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // CHRIS-PROTOCOL: Voorkom spam van bekende externe errors (Vercel Toolbar, etc.)
      if (event.message.includes('VercelToolbar')) return;

      console.error('[Watchdog] Client-side error caught:', event.error);

      fetch('/api/admin/system/watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: event.message,
          stack: event.error?.stack,
          component: 'ClientRuntime',
          url: window.location.href,
          level: 'critical',
          details: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            pathname: window.location.pathname
          }
        })
      }).catch(err => console.error('[Watchdog] Failed to report error:', err));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[Watchdog] Unhandled promise rejection:', event.reason);

      const error = event.reason;
      const message = error?.message || String(error);
      const stack = error?.stack;

      fetch('/api/admin/system/watchdog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Unhandled Rejection: ${message}`,
          stack: stack,
          component: 'ClientPromise',
          url: window.location.href,
          level: 'critical',
          details: {
            reason: error,
            pathname: window.location.pathname,
            search: window.location.search
          }
        })
      }).catch(err => console.error('[Watchdog] Failed to report rejection:', err));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <WatchdogContext.Provider value={null}>
      {children}
    </WatchdogContext.Provider>
  );
};

export const useWatchdog = () => useContext(WatchdogContext);
