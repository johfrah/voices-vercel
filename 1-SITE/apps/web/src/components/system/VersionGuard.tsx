"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 🛡️ NUCLEAR VERSION GUARD (BOB-METHOD 2026)
 * 
 * Doel: Forceert een browser-reload wanneer er een nieuwe versie online staat.
 * Dit voorkomt "Version Lag" waarbij de browser op een oude build blijft hangen.
 */
export function VersionGuard({ currentVersion }: { currentVersion: string }) {
  const pathname = usePathname();
  const lastCheck = useRef<number>(0); // Start at 0 to force check on mount

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Alleen checken op client-side
    if (typeof window === 'undefined') return;

    const checkVersion = async () => {
      try {
        // We halen de versie op via een lichte API call of de root headers
        const res = await fetch(`/api/admin/config?type=general&t=${Date.now()}`, { 
          cache: 'no-store',
          headers: { 'X-Version-Check': 'true' }
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        // 🛡️ CHRIS-PROTOCOL: Use server-provided version with fallback
        const serverVersion = data._version;

        // Als de server versie verschilt van de browser versie -> HARD RELOAD
        if (serverVersion && serverVersion !== currentVersion) {
          // 🛡️ CHRIS-PROTOCOL: Prevent infinite reload loops
          // If we already have a reloaded flag, don't reload again even if versions mismatch
          const hasReloaded = window.location.search.includes('reloaded=true');
          
          if (hasReloaded) {
            console.error(`🚀 [VersionGuard] Version mismatch persists after reload (Server: ${serverVersion}, Local: ${currentVersion}). Stopping loop.`);
            return;
          }

          console.warn(`🚀 [VersionGuard] New version detected: ${serverVersion} (current: ${currentVersion}). Reloading...`);
          
          const separator = window.location.href.includes('?') ? '&' : '?';
          window.location.href = `${window.location.href}${separator}reloaded=true`;
        }
      } catch (e) {
        // Silent fail om de user niet te storen
      }
    };

    // Check bij mount en route-verandering, maar max 1x per 30 seconden
    const now = Date.now();
    if (now - lastCheck.current > 30000) {
      lastCheck.current = now;
      checkVersion();
    }
  }, [pathname, currentVersion]);

  return null;
}
