"use client";

import { useSonicDNA } from '@/lib/sonic-dna';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

/**
 * 🌊 LIQUID TRANSITION OVERLAY
 * 
 * Een zijdezachte overgang tussen pagina's die de 'Ademing' feel versterkt.
 */
export function LiquidTransitionOverlay() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { playClick } = useSonicDNA();

  useEffect(() => {
    // Start transition when pathname changes
    setIsTransitioning(true);
    
    // Play a very subtle swell on transition
    // playClick('swell');

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // Match with CSS duration

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] pointer-events-none transition-all duration-700 ease-va-bezier",
        isTransitioning ? "bg-va-off-white opacity-100" : "bg-va-off-white opacity-0"
      )}
    >
      <div className={cn(
        "absolute inset-0 hmagic opacity-10 transition-transform duration-1000 ease-va-bezier",
        isTransitioning ? "scale-110 rotate-3" : "scale-100 rotate-0"
      )} />
    </div>
  );
}
