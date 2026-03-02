"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { ClientLogger } from '@/lib/system/client-logger';

/**
 *  WATCHDOG PROVIDER (2026)
 * 
 * Doel: Vangt alle onbehandelde runtime errors op de client-side op
 * en stuurt deze naar de /api/admin/system/watchdog route via ClientLogger.
 */

const WatchdogContext = createContext<null>(null);

export const WatchdogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // CHRIS-PROTOCOL: Voorkom spam van bekende externe errors (Vercel Toolbar, etc.)
      if (event.message.includes('VercelToolbar')) return;

      console.error('[Watchdog] Client-side error caught:', event.error);

      ClientLogger.report('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        component: 'ClientRuntime'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[Watchdog] Unhandled promise rejection:', event.reason);

      const error = event.reason;
      const message = error?.message || String(error);

      ClientLogger.report('error', `Unhandled Rejection: ${message}`, {
        stack: error?.stack,
        reason: error,
        component: 'ClientPromise'
      });
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
