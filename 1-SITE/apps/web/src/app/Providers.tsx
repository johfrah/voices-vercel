"use client";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { GlobalAudioProvider } from '@/contexts/GlobalAudioContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { VoicesMasterControlProvider } from '@/contexts/VoicesMasterControlContext';
import { VoicesStateProvider } from '@/contexts/VoicesStateContext';
import { WatchdogProvider } from '@/contexts/WatchdogContext';
import { WorldProvider } from '@/contexts/WorldContext';
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
  initialUsage,
  handshakeContext
}: {
  children: ReactNode;
  lang: string;
  market: MarketConfig;
  initialTranslations?: Record<string, string>;
  initialJourney?: any;
  initialUsage?: any;
  handshakeContext?: {
    worldId: number;
    languageId: number;
    journeyId: number | null;
    worldConfig: any;
  };
}) {
  // 🛡️ CHRIS-PROTOCOL: Critical Null-Safety Guard (v2.27.8)
  // Prevent catastrophic failure if market is undefined during SSR/hydration
  if (!market) {
    console.error('[Providers] CRITICAL: market is undefined! Using emergency fallback.');
    market = {
      market_code: 'BE',
      language: 'nl',
      primary_language: 'nl-BE',
      primary_language_id: 1,
      supported_languages: ['nl-BE'],
      popular_languages: ['nl-BE'],
      currency: 'EUR',
      name: 'Voices',
      phone: '',
      email: '',
      logo_url: '',
      company_name: 'Voices',
      vat_number: '',
      theme: 'voices'
    };
  }

  const pathname = usePathname();
  // 🛡️ CHRIS-PROTOCOL: Version Sync Mandate (v2.27.8)
  // Major Refactor: ID-First Handshake Architecture
  const currentVersion = '2.28.0';

  // 🛡️ CHRIS-PROTOCOL: Language is now strictly passed from Server (Source of Truth)
  // to prevent Hydration Mismatch errors (#419, #425).
  // We use the 'lang' prop directly instead of calculating it from pathname
  // to ensure consistency between SSR and Client.
  const activeLang = lang || (market?.primary_language || 'nl-BE');

  // 🛡️ CHRIS-PROTOCOL: Prime MarketManager on the client with the server-provided market data
  // This prevents the client from falling back to static defaults during hydration.
    if (typeof window !== 'undefined' && market) {
    // We use a ref-like pattern to only prime once per mount
    const g = window as any;
    if (!g.__marketPrimed) {
      // Set the market in the cache to prevent hydration mismatch (#419)
      const host = window.location.host.replace('www.', '');
      (MarketManagerServer as any).cache[host] = market;

      // 🛡️ CHRIS-PROTOCOL: Prime Handshake Context
      if (handshakeContext) {
        g.handshakeContext = handshakeContext;
        (MarketManagerServer as any).worldConfigsCache[`${handshakeContext.worldId}-${handshakeContext.languageId}`] = handshakeContext.worldConfig;
      }

      MarketManagerServer.setLanguages(Object.values(initialTranslations || {}).length > 0 ? [] : []); // Placeholder for languages if needed
      
      // 🛡️ CHRIS-PROTOCOL: Prime World Languages on Client
      if (g.handshakeWorldLanguages) {
        MarketManagerServer.setWorldLanguages(g.handshakeWorldLanguages);
      }
      
      g.__marketPrimed = true;
    }
  }

  //  CHRIS-PROTOCOL: Initialize Client Logger for real-time error reporting
  React.useEffect(() => {
    ClientLogger.init();
    // ... rest of the hook
  }, []);

  return (
    <WatchdogProvider>
      <WorldProvider>
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
                        <DebugLogger currentVersion={currentVersion} pathname={pathname} activeLang={activeLang} />
                        {children}
                      </NotificationProvider>
                    </GlobalAudioProvider>
                  </EditModeProvider>
                </TranslationProvider>
              </VoicesMasterControlProvider>
            </CheckoutProvider>
          </VoicesStateProvider>
        </AuthProvider>
      </WorldProvider>
    </WatchdogProvider>
  );
}

/**
 * 🛡️ CHRIS-PROTOCOL: DebugLogger (v2.24.6)
 * Only renders debug logs and reports system context for authenticated admins.
 * This prevents leaking system internals to public visitors.
 */
function DebugLogger({ 
  currentVersion, 
  pathname, 
  activeLang 
}: { 
  currentVersion: string; 
  pathname: string; 
  activeLang: string; 
}) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !isAdmin) return;

    // 🛡️ DEBUG MANDATE: Detailed System Info for Forensic Analysis (Admin Only)
    if (typeof window !== 'undefined') {
      const g = window as any;
      const host = window.location.host.replace('www.', '');
      const handshake = g.handshakeContext;
      const currentMarket = MarketManagerServer.getCurrentMarket(host, pathname);
      const contextResolved = MarketManagerServer.resolveContext(host, pathname);
      const worldId = handshake?.worldId || contextResolved.worldId;
      const languageId = handshake?.languageId || contextResolved.languageId;
      
      console.log(`🚀 [Voices] Nuclear Version: v${currentVersion} (Godmode Zero)`);
      console.group('🛡️ [Voices] Forensic System Context');
      console.log('Version:', currentVersion);
      console.log('World ID:', worldId);
      console.log('Language ID:', languageId);
      console.log('Market:', currentMarket.market_code, `(${currentMarket.name})`);
      console.log('Language:', activeLang);
      console.log('Pathname:', pathname);
      console.log('Host:', host);
      if (handshake?.worldConfig) console.log('World Config:', handshake.worldConfig);
      console.groupEnd();

      // 🛡️ WATCHDOG MANDATE: Report system context to database for forensic analysis
      ClientLogger.report('info', `System Context: World ${worldId}, Lang ${languageId}`, {
        version: currentVersion,
        worldId,
        languageId,
        market: currentMarket.market_code,
        lang: activeLang,
        pathname,
        host
      });

      (window as any).__VOICES_VERSION__ = currentVersion;
      (window as any).__VOICES_MARKET__ = currentMarket;
      (window as any).__VOICES_WORLD_ID__ = worldId;
    }
  }, [currentVersion, pathname, activeLang, isAdmin, isAuthenticated, isLoading]);

  return null;
}
