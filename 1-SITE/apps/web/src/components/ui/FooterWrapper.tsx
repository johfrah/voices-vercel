"use client";

import GlobalFooter from "@/components/ui/GlobalFooter";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEffect, useState } from 'react';

/**
 * FOOTER WRAPPER (Client Component)
 * Verbergt de footer als we op de frontpage zijn en niet in Edit Mode.
 */
export default function FooterWrapper() {
  const { isEditMode } = useEditMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Verberg footer in de mailbox
  if (window.location.pathname.startsWith('/account/mailbox')) {
    return null;
  }

  // Verberg footer als we in "Under Construction" modus zijn
  // Maar we laten hem nu wel zien voor de navigatie naar Studio, Academy etc.
  // if (!isEditMode && window.location.pathname === '/') {
  //   return null;
  // }

  return <GlobalFooter />;
}
