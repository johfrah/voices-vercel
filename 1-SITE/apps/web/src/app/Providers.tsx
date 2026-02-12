"use client";

import React, { ReactNode } from 'react';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { VoicesStateProvider } from '@/contexts/VoicesStateContext';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Detect language from pathname
  const langMatch = pathname.match(/^\/(nl|fr|en|de)(\/|$)/);
  const lang = langMatch ? langMatch[1] : 'nl';

  return (
    <TranslationProvider lang={lang}>
      <AuthProvider>
        <EditModeProvider>
          <VoicesStateProvider>
            <CheckoutProvider>
              {children}
            </CheckoutProvider>
          </VoicesStateProvider>
        </EditModeProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}
