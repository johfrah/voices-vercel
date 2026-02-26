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
import { MarketConfig, MarketManagerServer } from '@/lib/system/market-manager-server';
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
  const currentVersion = '2.15.057';


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

  // 🛡️ CHRIS-PROTOCOL: Prime MarketManager on the client with the server-provided market data
  // This prevents the client from falling back to static defaults during hydration.
  if (typeof window !== 'undefined' && market) {
    // We use a ref-like pattern to only prime once per mount
    const g = window as any;
    if (!g.__marketPrimed) {
      // Set the market in the cache to prevent hydration mismatch (#419)
      const host = window.location.host.replace('www.', '');
      (MarketManagerServer as any).cache[host] = market;
      
      MarketManagerServer.setLanguages(Object.values(initialTranslations || {}).length > 0 ? [] : []); // Placeholder for languages if needed
      g.__marketPrimed = true;
    }
  }

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
                      background: 'hsl(160 28% 98%)',
                      color: 'hsl(160 28% 25%)',
                      borderRadius: '32px',
                      border: '2px solid hsl(160 28% 48% / 0.1)',
                      fontFamily: 'var(--font-cormorant), serif',
                      boxShadow: '0 8px 32px rgba(123, 168, 150, 0.15)',
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
