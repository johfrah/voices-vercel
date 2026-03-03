"use client";

import { ContainerInstrument } from "@/components/ui/LayoutInstruments";
import { NAVIGATION_FEEDBACK_START_EVENT } from "@/lib/utils/navigation-feedback";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 180;
const MAX_VISIBLE_MS = 4000;

export function NavigationSkeletonOverlayInstrument() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const forceHideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onNavigationStart = () => {
      startedAtRef.current = Date.now();
      setIsVisible(true);

      if (forceHideTimerRef.current !== null) {
        window.clearTimeout(forceHideTimerRef.current);
      }

      forceHideTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        startedAtRef.current = null;
      }, MAX_VISIBLE_MS);
    };

    window.addEventListener(NAVIGATION_FEEDBACK_START_EVENT, onNavigationStart);

    return () => {
      window.removeEventListener(NAVIGATION_FEEDBACK_START_EVENT, onNavigationStart);
      if (forceHideTimerRef.current !== null) {
        window.clearTimeout(forceHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || startedAtRef.current === null) return;

    const elapsedMs = Date.now() - startedAtRef.current;
    const remainingMs = Math.max(0, MIN_VISIBLE_MS - elapsedMs);
    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
      startedAtRef.current = null;
    }, remainingMs);

    return () => window.clearTimeout(hideTimer);
  }, [pathname, isVisible]);

  if (!isVisible) return null;

  return (
    <ContainerInstrument
      plain
      className="fixed inset-0 z-[10001] pointer-events-none bg-background/92 backdrop-blur-[1.5px]"
      aria-hidden
    >
      <ContainerInstrument plain className="mx-auto max-w-7xl px-6 md:px-10 pt-24 md:pt-32 animate-pulse">
        <ContainerInstrument plain className="h-9 w-40 rounded-full bg-va-black/10" />
        <ContainerInstrument plain className="mt-8 h-12 w-[70%] rounded-full bg-va-black/10" />
        <ContainerInstrument plain className="mt-4 h-5 w-[48%] rounded-full bg-va-black/10" />

        <ContainerInstrument plain className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ContainerInstrument plain className="h-40 rounded-[22px] bg-va-black/8" />
          <ContainerInstrument plain className="h-40 rounded-[22px] bg-va-black/8" />
          <ContainerInstrument plain className="h-40 rounded-[22px] bg-va-black/8" />
        </ContainerInstrument>
      </ContainerInstrument>
    </ContainerInstrument>
  );
}
