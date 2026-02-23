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

export function Providers({ 
  children,
  lang,
  initialTranslations = {}
}: { 
  children: ReactNode;
  lang: string;
  initialTranslations?: Record<string, string>;
}) {
  const pathname = usePathname();
  
  //  CHRIS-PROTOCOL: Initialize Client Logger for real-time error reporting
      React.useEffect(() => {
        ClientLogger.init();
        console.log('🚀 [Voices] Nuclear Version: v2.13.67 (Godmode Zero)');
      }, []);
  
  //  CHRIS-PROTOCOL: Language is now strictly passed from Server (Source of Truth)
  // to prevent Hydration Mismatch errors (#419, #425).
  
  //  BOB'S MANDATE: Admin/Dashboard routes altijd in het Nederlands (NL)
  // We checken zowel de URL prefix als de ruwe route om leaks te voorkomen.
  const isAdminPath = pathname?.includes('/admin') || 
                      pathname?.includes('/backoffice') || 
                      pathname?.includes('/studio/beheer');
                      
  const activeLang = isAdminPath ? 'nl' : (lang || 'nl');

  return (
    <WatchdogProvider>
      <AuthProvider>
        <TranslationProvider lang={activeLang} initialTranslations={initialTranslations}>
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
    </WatchdogProvider>
  );
}
