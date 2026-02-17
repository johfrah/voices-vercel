"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PredictiveRouter } from '@/lib/predictive-router';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useSonicDNA } from '@/lib/sonic-dna';

export const VoicyBridge: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const checkout = useCheckout();
  const { playClick } = useSonicDNA();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Intelligent Intent Detection
    const intent = PredictiveRouter.determineIntent(pathname, searchParams);
    if (intent && intent.greeting) {
      console.log(`Voicy Intent Detected: ${intent.intent} (${intent.reason})`);
      (window as any).voicy_next_greeting = intent.greeting;
    }

    // Define the Voicy Bridge
    (window as any).Voicy = {
      navigate: (path: string) => {
        console.log(`Voicy navigating to: ${path}`);
        router.push(path);
      },
      search: (query: string) => {
        console.log(`Voicy searching for: ${query}`);
        router.push(`/agency?search=${encodeURIComponent(query)}`);
      },
      
      //  Checkout Controls (AI-Native)
      checkout: {
        setBriefing: (text: string) => {
          playClick('deep');
          checkout.updateBriefing(text);
          return `Script bijgewerkt naar ${text.split(' ').length} woorden.`;
        },
        setUsage: (usage: 'telefonie' | 'unpaid' | 'paid') => {
          playClick('light');
          checkout.updateUsage(usage);
          return `Projecttype gewijzigd naar ${usage}.`;
        },
        nextStep: () => {
          playClick('deep');
          const steps: any[] = ['briefing', 'voice', 'details', 'payment', 'done'];
          const currentIndex = steps.indexOf(checkout.state.step);
          if (currentIndex < steps.length - 1) {
            checkout.setStep(steps[currentIndex + 1]);
            return `Opgeslagen. Door naar de volgende stap: ${steps[currentIndex + 1]}.`;
          }
          return "Je bent al bij de laatste stap.";
        },
        getPricing: () => checkout.state.pricing,
        getState: () => checkout.state
      },

      calculatePrice: (usage: string, words: number) => {
        console.log(`Voicy calculating price for ${usage} with ${words} words`);
      },
      getStudioStatus: () => {
        const ldJson = document.querySelector('script[type="application/ld+json"]');
        if (ldJson) {
          try {
            const data = JSON.parse(ldJson.innerHTML);
            return data.data;
          } catch (e) {
            return null;
          }
        }
        return null;
      },
      getIntent: () => intent,
      getContext: () => {
        return {
          url: window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          intent: intent,
          checkout: checkout.state
        };
      }
    };

    return () => {
      delete (window as any).Voicy;
    };
  }, [router, checkout, pathname, searchParams, playClick]);

  return null;
};
