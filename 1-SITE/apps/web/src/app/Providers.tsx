"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { GlobalAudioProvider } from '@/contexts/GlobalAudioContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { VoicesMasterControlProvider } from '@/contexts/VoicesMasterControlContext';
import { VoicesStateProvider } from '@/contexts/VoicesStateContext';
import { WatchdogProvider } from '@/contexts/WatchdogContext';
import { ClientLogger } from '@/lib/system/client-logger';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';

import { VersionGuard } from '@/components/system/VersionGuard';
import { MarketConfig } from '@/lib/system/market-manager-server';
import { Toaster } from 'react-hot-toast';

export function Providers({
  children,
  lang,
  market,
  initialTranslations = {},
  initialJourney,
  initialUsage
}: {
  children: ReactNode;
  lang: string;
  market: MarketConfig;
  initialTranslations?: Record<string, string>;
  initialJourney?: any;
  initialUsage?: any;
}) {
  const pathname = usePathname();
  const currentVersion = '2.14.716';


  //  CHRIS-PROTOCOL: Initialize Client Logger for real-time error reporting
  React.useEffect(() => {
    ClientLogger.init();
    console.log(`🚀 [Voices] Nuclear Version: v${currentVersion} (Godmode Zero)`);
  }, []);

  //  CHRIS-PROTOCOL: Language is now strictly passed from Server (Source of Truth)
  // to prevent Hydration Mismatch errors (#419, #425).
  // We use the 'lang' prop directly instead of calculating it from pathname
  // to ensure consistency between SSR and Client.
  const activeLang = lang || (market.primary_language || 'nl-BE');

  return (
    <WatchdogProvider>
      <AuthProvider>
        <VoicesStateProvider>
          <CheckoutProvider>
            <VoicesMasterControlProvider initialJourney={initialJourney} initialUsage={initialUsage}>
              <TranslationProvider lang={activeLang} market={market} initialTranslations={initialTranslations}>
                <VersionGuard currentVersion={currentVersion} />
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                  containerStyle={{
                    top: '40%',
                  }}
                  toastOptions={{
                    style: market.market_code === 'ADEMING' ? {
                      background: '#FAF9F6',
                      color: '#1A1A1A',
                      borderRadius: '24px',
                      border: '1px solid rgba(0,0,0,0.05)',
                      fontFamily: 'var(--font-cormorant), serif',
                    } : undefined
                  }}
                />
                <EditModeProvider>
                  <GlobalAudioProvider>
                    <NotificationProvider>
                      {children}
                    </NotificationProvider>
                  </GlobalAudioProvider>
                </EditModeProvider>
              </TranslationProvider>
            </VoicesMasterControlProvider>
          </CheckoutProvider>
        </VoicesStateProvider>
      </AuthProvider>
    </WatchdogProvider>
  );
}
