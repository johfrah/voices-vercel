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
  const lastCheck = useRef<number>(Date.now());

  useEffect(() => {
    // 🛡️ CHRIS-PROTOCOL: Alleen checken op client-side
    if (typeof window === 'undefined') return;

    const checkVersion = async () => {
      try {
        // We halen de versie op via een lichte API call of de root headers
        const res = await fetch('/api/admin/config?type=general', { 
          cache: 'no-store',
          headers: { 'X-Version-Check': 'true' }
        });
        
        if (!res.ok) return;
        
        // Vercel stuurt vaak een 'x-vercel-id' of we kunnen onze eigen header gebruiken
        // Voor nu checken we of de server een andere versie rapporteert in de response
        const data = await res.json();
        const serverVersion = data._version || process.env.NEXT_PUBLIC_APP_VERSION;

        // Als de server versie verschilt van de browser versie -> HARD RELOAD
        if (serverVersion && serverVersion !== currentVersion) {
          console.warn(`🚀 [VersionGuard] New version detected: ${serverVersion}. Reloading...`);
          window.location.reload();
        }
      } catch (e) {
        // Silent fail om de user niet te storen
      }
    };

    // Check bij elke route-verandering, maar max 1x per minuut
    const now = Date.now();
    if (now - lastCheck.current > 60000) {
      lastCheck.current = now;
      checkVersion();
    }
  }, [pathname, currentVersion]);

  return null;
}
