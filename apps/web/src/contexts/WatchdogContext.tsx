"use client";

import React, { createContext, useContext } from 'react';

/**
 *  WATCHDOG PROVIDER (2026)
 * 
 * Doel: Vangt alle onbehandelde runtime errors op de client-side op
 * en stuurt deze naar de /api/admin/system/watchdog route via ClientLogger.
 */

const WatchdogContext = createContext<null>(null);

export const WatchdogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Global handlers worden centraal beheerd door ClientLogger.init() in Providers.
  // Hiermee voorkomen we dubbele captures en event-amplificatie.

  return (
    <WatchdogContext.Provider value={null}>
      {children}
    </WatchdogContext.Provider>
  );
};

export const useWatchdog = () => useContext(WatchdogContext);
