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
import { WatchdogProvider } from '@/contexts/WatchdogContext';
import { usePathname } from 'next/navigation';
import { ClientLogger } from '@/lib/system/client-logger';

import { MarketConfig } from '@/lib/system/market-manager-server';
import { VersionGuard } from '@/components/system/VersionGuard';
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
  const currentVersion = '2.14.459';
  
  //  CHRIS-PROTOCOL: Initialize Client Logger for real-time error reporting
  React.useEffect(() => {
    ClientLogger.init();
    console.log(`🚀 [Voices] Nuclear Version: v${currentVersion} (Godmode Zero)`);
  }, []);
  
  //  CHRIS-PROTOCOL: Language is now strictly passed from Server (Source of Truth)
  // to prevent Hydration Mismatch errors (#419, #425).
  // We use the 'lang' prop directly instead of calculating it from pathname
  // to ensure consistency between SSR and Client.
  const activeLang = lang || 'nl';

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
