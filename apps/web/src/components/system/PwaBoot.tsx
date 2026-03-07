"use client";

import { useEffect } from "react";

export function PwaBoot() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Never run PWA caching in local dev; it can stale-cache Next dev chunks.
    if (process.env.NODE_ENV !== "production") {
      const cleanupDevServiceWorkers = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        } catch {
          // Silent by design in development.
        }

        try {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("voices-mobile-"))
              .map((key) => caches.delete(key))
          );
        } catch {
          // Silent by design in development.
        }
      };

      void cleanupDevServiceWorkers();
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Silent by design. PWA registration must never block rendering.
      }
    };

    if (document.readyState === "complete") {
      void register();
      return;
    }

    const onLoad = () => {
      void register();
    };

    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
