/**
 * ⚡ NUCLEAR CACHE MANAGER (2026)
 * 
 * Beheert de performance en caching voor de Next.js Core-laag.
 * Vervangt het PHP VoicesNitro system en OPCACHE resets.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

export interface CacheStats {
  lastCleared?: string;
  clearedBy?: string;
  types: string[];
}

/**
 * 🚀 NUCLEAR FLUSH
 * Wist alle relevante caches voor de Next.js app.
 */
export async function flushCoreCache(path?: string) {
  if (path) {
    revalidatePath(path);
  } else {
    // Flush alles (layout level)
    revalidatePath('/', 'layout');
  }
  
  // Revalidate specifieke data-tags
  revalidateTag('pricing');
  revalidateTag('voices');
  revalidateTag('translations');

  console.log(`☢️ NUCLEAR CACHE FLUSHED: ${path || 'FULL SITE'}`);
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Core cache successfully revalidated.'
  };
}

/**
 * ⏱️ PERFORMANCE MONITOR
 * Meet de execution time van kritieke operaties (conform Protocol 2026).
 */
export function startPerformanceTimer(label: string) {
  const start = performance.now();
  return {
    stop: () => {
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      if (parseFloat(duration) > 500) {
        console.warn(`🐢 SLOW OPERATION DETECTED: ${label} took ${duration}ms`);
      }
      return duration;
    }
  };
}

/**
 * 🖼️ IMAGE OPTIMIZATION HINTS
 * Genereert de juiste aspect-ratio en loading hints voor de UI.
 */
export function getImagePerformanceHints(index: number) {
  return {
    priority: index < 3, // Eerste 3 afbeeldingen hebben prioriteit (LCP)
    loading: index < 3 ? 'eager' : 'lazy' as const,
    fetchPriority: index < 3 ? 'high' : 'low' as const
  };
}
