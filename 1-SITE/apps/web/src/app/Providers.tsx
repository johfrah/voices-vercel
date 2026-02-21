"use client";

import React, { ReactNode } from 'react';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { VoicesStateProvider } from '@/contexts/VoicesStateContext';
import { GlobalAudioProvider } from '@/contexts/GlobalAudioContext';
import { VoicesMasterControlProvider } from '@/contexts/VoicesMasterControlContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { usePathname } from 'next/navigation';
import { MarketManager } from '@config/market-manager';

export function Providers({ 
  children,
  initialTranslations = {}
}: { 
  children: ReactNode;
  initialTranslations?: Record<string, string>;
}) {
  const pathname = usePathname();
  
  // Detect language from pathname or market
  const langMatch = pathname.match(/^\/(nl|fr|en|de)(\/|$)/);
  
  //  CHRIS-PROTOCOL: Market-Aware Language Resolution
  // We check the host to determine the default language for the market.
  const host = typeof window !== 'undefined' ? window.location.host : 'voices.be';
  const market = MarketManager.getCurrentMarket(host);
  
  let lang = langMatch ? langMatch[1] : (market.language || 'nl');

  //  BOB'S MANDATE: Admin/Dashboard routes altijd in het Nederlands (NL)
  if (pathname.startsWith('/admin') || pathname.startsWith('/backoffice') || pathname.startsWith('/studio/beheer')) {
    lang = 'nl';
  }

  return (
    <AuthProvider>
      <TranslationProvider lang={lang} initialTranslations={initialTranslations}>
        <EditModeProvider>
          <VoicesStateProvider>
            <GlobalAudioProvider>
              <CheckoutProvider>
                <NotificationProvider>
                  <VoicesMasterControlProvider>
                    {children}
                  </VoicesMasterControlProvider>
                </NotificationProvider>
              </CheckoutProvider>
            </GlobalAudioProvider>
          </VoicesStateProvider>
        </EditModeProvider>
      </TranslationProvider>
    </AuthProvider>
  );
}
